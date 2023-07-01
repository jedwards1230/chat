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

import { getChatHistory, readStream, callTool } from "../utils";
import { chatReducer } from "@/reducers/chatReducer";

export const initialState: ChatState = {
	threadList: [],
	input: "",
	activeThread: {
		id: uuidv4(),
		title: "New Chat",
		messages: [],
		agentConfig: {
			id: "",
			name: "",
			model: "gpt-3.5-turbo-16k",
		},
	},
	activeThreadId: "",
	handleSubmit: () => {},
	createNewThread: () => {},
	removeThread: () => {},
};

const baseEntry = initialState.activeThread;

const ChatContext = createContext<ChatState>(initialState);
const ChatDispatchContext = createContext<Dispatch<ChatAction>>(() => {});

export const useChatCtx = () => useContext(ChatContext);
export const useChatDispatch = () => useContext(ChatDispatchContext);

export function ChatProvider({ children }: { children: React.ReactNode }) {
	const [checkedLocal, setCheckedLocal] = useState(false);
	const [state, dispatch] = useReducer(chatReducer, {
		...initialState,
		threadList: [baseEntry],
		activeThreadId: baseEntry.id,
	});

	useEffect(() => {
		const history = getChatHistory();
		if (history) dispatch({ type: "INITIALIZE", payload: history });
		setCheckedLocal(true);
	}, []);

	// Get active thread from local storage, or initialize with default entry
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

	useEffect(() => {
		dispatch({ type: "CHANGE_ACTIVE_THREAD", payload: activeThread.id });
	}, [activeThread.id]);

	const createNewThread = () => {
		const newId = uuidv4();
		const newEntry: ChatEntry = {
			...baseEntry,
			id: newId,
		};
		dispatch({ type: "CREATE_THREAD", payload: newEntry });
		dispatch({ type: "CHANGE_INPUT", payload: "" });
	};

	// Function to remove a thread and update the local storage
	const removeThread = (id: string) => {
		dispatch({ type: "REMOVE_THREAD", payload: id });
		if (state.threadList.length === 1) {
			createNewThread();
		} else {
			dispatch({
				type: "CHANGE_ACTIVE_THREAD",
				payload: state.threadList[0].id,
			});
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (state.input.length > 0) {
			const userId = uuidv4();
			const userMsg: Message = {
				id: userId,
				content: state.input,
				role: "user",
			};

			dispatch({
				type: "UPSERT_MESSAGE",
				payload: {
					threadId: state.activeThread.id,
					message: userMsg,
				},
			});

			dispatch({ type: "CHANGE_INPUT", payload: "" });

			const msgHistory = state.activeThread.messages;
			msgHistory.push(userMsg);

			const getChat = async (msgHistory: Message[]) => {
				fetch("/api/chat", {
					method: "POST",
					body: JSON.stringify({
						msgHistory,
						modelName: state.activeThread.agentConfig.model,
						temperature: 0.5,
					}),
				})
					.then(async (res) => {
						if (!res.body) {
							throw new Error("No response body from /api/chat");
						}

						const assistantId = uuidv4();

						let tool: "calculator" | undefined;
						let accumulatedResponse = "";
						await readStream(res.body, (chunk: string) => {
							const chunks = chunk
								.split("\n")
								.filter((c) => c.length > 0)
								.map((c) => {
									const jsonStr = c.replace("data: ", "");
									if (jsonStr === "[DONE]") return;
									try {
										return JSON.parse(jsonStr);
									} catch (e) {
										console.error(e);
										accumulatedResponse += jsonStr;
										return;
									}
								});

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
								function_call: tool,
							};
							msgHistory.push(assistantMsg);

							dispatch({
								type: "UPSERT_MESSAGE",
								payload: {
									threadId: state.activeThread.id,
									message: assistantMsg,
								},
							});

							const res = callTool(tool, input);
							if (!res) {
								throw new Error("Tool failure");
							}

							const functionMsg: Message = {
								id: uuidv4(),
								content: res,
								role: "function",
								name: tool as string,
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
						throw new Error("No response body from /api/chat");
					}

					await readStream(res.body, (chunk: string) => {
						dispatch({
							type: "UPSERT_TITLE",
							payload: {
								threadId: state.activeThread.id,
								title: chunk,
							},
						});
					});
				})
				.catch((err) => {
					console.error(err);
				});
		}
	};

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
				createNewThread,
				removeThread,
			}}
		>
			<ChatDispatchContext.Provider value={dispatch}>
				{children}
			</ChatDispatchContext.Provider>
		</ChatContext.Provider>
	);
}
