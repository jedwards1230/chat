"use client";

import {
	Dispatch,
	createContext,
	useContext,
	useEffect,
	useReducer,
	useState,
} from "react";
import { v4 as uuidv4 } from "uuid";

import {
	getChatHistory,
	readStream,
	callTool,
	parseStreamData,
} from "../utils";
import { chatReducer } from "@/reducers/chatReducer";
import initialState from "./initialChat";

const baseEntry = initialState.activeThread;

const ChatContext = createContext<ChatState>(initialState);
const ChatDispatchContext = createContext<Dispatch<ChatAction>>(() => {});

export const useChat = () => useContext(ChatContext);
export const useChatDispatch = () => useContext(ChatDispatchContext);

export function ChatProvider({ children }: { children: React.ReactNode }) {
	const [checkedLocal, setCheckedLocal] = useState(false);
	const [state, dispatch] = useReducer(chatReducer, {
		...initialState,
		threadList: [baseEntry],
		activeThreadId: baseEntry.id,
	});

	// Get active thread from local storage, or initialize with default entry
	const getActive = () => {
		const active = state.threadList.find(
			(thread) => thread.id === state.activeThreadId
		);
		let activeThread: ChatEntry;
		if (active) {
			activeThread = active;
		} else if (state.threadList) {
			activeThread = state.threadList[state.threadList.length - 1];
		} else {
			activeThread = baseEntry;
		}

		return activeThread;
	};

	const activeThread = getActive();

	// Function to create a user message
	const createUserMsg = (content: string): Message => {
		const userId = uuidv4();
		const userMsg: Message = {
			id: userId,
			content: content,
			role: "user",
		};
		return userMsg;
	};

	// Function to dispatch user message
	const dispatchUserMsg = (userMsg: Message) => {
		dispatch({
			type: "UPSERT_MESSAGE",
			payload: {
				threadId: state.activeThread.id,
				message: userMsg,
			},
		});

		dispatch({ type: "CHANGE_INPUT", payload: "" });
	};

	const fetchTitle = async () => {
		const l = state.activeThread.messages.length;
		if (l < 2 || l > 10) return;

		const history = state.activeThread.messages.map(
			(msg) => msg.role + ": " + msg.content
		);
		history.push("user: " + state.input);
		fetch("/api/get_title", {
			method: "POST",
			body: JSON.stringify({
				history: history.join("\n"),
			}),
		})
			.then(async (res) => {
				if (!res.body) {
					throw new Error("No response body from /api/get_title");
				}

				await readStream(res.body, (chunk: string) => {
					const chunks = parseStreamData(chunk);

					const accumulatedResponse = chunks.reduce(
						(acc: string, curr: any) => {
							if (!curr) return acc;
							const res = curr.choices[0];
							if (res.finish_reason) {
								return acc;
							}
							if (res.delta.function_call) {
								throw new Error("Function call in get_title");
							}
							return acc + res.delta.content;
						},
						""
					);

					dispatch({
						type: "UPSERT_TITLE",
						payload: {
							threadId: state.activeThread.id,
							title: accumulatedResponse,
						},
					});
				});
			})
			.catch((err) => {
				console.error(err);
			});
	};

	// Handler for submitting the chat form
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (state.input.length > 0) {
			const userMsg: Message = createUserMsg(state.input);
			dispatchUserMsg(userMsg);

			const msgHistory = state.activeThread.messages;
			msgHistory.push(userMsg);

			const getChat = async (msgHistory: Message[]) => {
				fetch("/api/chat", {
					method: "POST",
					body: JSON.stringify({
						msgHistory: msgHistory.map((msg) => {
							return {
								content: msg.content,
								role: msg.role,
								name: msg.name,
								function_call: msg.function_call,
							};
						}),
						modelName: state.activeThread.agentConfig.model,
						temperature: 0.5,
					}),
				})
					.then(async (res) => {
						if (!res.body) {
							throw new Error("No response body from /api/chat");
						}

						const assistantId = uuidv4();
						let tool: string = "";
						let accumulatedResponse = "";
						await readStream(res.body, (chunk: string) => {
							const chunks = parseStreamData(chunk);

							accumulatedResponse = chunks.reduce(
								(acc: string, curr: any) => {
									if (!curr) return acc;
									const res = curr.choices[0];
									if (res.finish_reason) {
										return acc;
									}
									if (res.delta.function_call) {
										if (res.delta.function_call.name) {
											tool = res.delta.function_call.name;
										}
										return (
											acc +
											res.delta.function_call.arguments
										);
									}
									return acc + res.delta.content;
								},
								""
							);

							// dispatch to frontend, chunk by chunk
							// tool response must be built before dispatching
							if (!tool) {
								const assistantMsg: Message = {
									id: assistantId,
									content: accumulatedResponse,
									role: "assistant",
								};

								dispatch({
									type: "UPSERT_MESSAGE",
									payload: {
										threadId: state.activeThread.id,
										message: assistantMsg,
									},
								});
							}
						});

						if (tool) {
							const { input } = JSON.parse(accumulatedResponse);
							const assistantMsg: Message = {
								id: assistantId,
								content: input,
								role: "assistant",
								name: tool,
								function_call: {
									name: tool,
									arguments: input,
								},
							};
							msgHistory.push(assistantMsg);

							dispatch({
								type: "UPSERT_MESSAGE",
								payload: {
									threadId: state.activeThread.id,
									message: assistantMsg,
								},
							});

							const res = await callTool(tool, input);
							if (!res) {
								throw new Error("Tool failure");
							}

							const functionMsg: Message = {
								id: uuidv4(),
								content: res,
								role: "function",
								name: tool,
							};

							msgHistory.push(functionMsg);

							dispatch({
								type: "UPSERT_MESSAGE",
								payload: {
									threadId: state.activeThread.id,
									message: functionMsg,
								},
							});

							getChat(msgHistory);
						}
					})
					.catch((err) => {
						console.error(err);
					});
			};

			getChat(msgHistory);
			fetchTitle();
		}
	};

	// Effect to check stored chat history on component mount
	useEffect(() => {
		const history = getChatHistory();
		if (history) dispatch({ type: "INITIALIZE", payload: history });
		setCheckedLocal(true);
	}, []);

	// Effect to change the active thread ID when the active thread is updated
	useEffect(() => {
		dispatch({ type: "CHANGE_ACTIVE_THREAD", payload: activeThread.id });
	}, [activeThread.id]);

	// Effect to sync local storage with the chat thread list
	useEffect(() => {
		if (typeof window !== "undefined" && checkedLocal) {
			localStorage.setItem(
				"chatHistory",
				JSON.stringify(state.threadList)
			);
		}
	}, [
		state.threadList,
		state.threadList.length,
		activeThread,
		activeThread.messages,
		activeThread.messages.length,
		checkedLocal,
	]);

	return (
		<ChatContext.Provider
			value={{
				threadList: state.threadList,
				input: state.input,
				activeThread,
				activeThreadId: state.activeThreadId,
				handleSubmit,
			}}
		>
			<ChatDispatchContext.Provider value={dispatch}>
				{children}
			</ChatDispatchContext.Provider>
		</ChatContext.Provider>
	);
}
