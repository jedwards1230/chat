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
	isMobile,
} from "../utils";
import { chatReducer } from "@/providers/chatReducer";
import initialState from "./initialChat";

const ChatContext = createContext<ChatState>(initialState);
const ChatDispatchContext = createContext<Dispatch<ChatAction>>(() => {});

export const useChat = () => useContext(ChatContext);
export const useChatDispatch = () => useContext(ChatDispatchContext);

export function ChatProvider({ children }: { children: React.ReactNode }) {
	const [checkedLocal, setCheckedLocal] = useState(false);
	const [state, dispatch] = useReducer(chatReducer, initialState);

	// Function to create a user message
	const createUserMsg = (
		content: string,
		editId?: string | null
	): Message => ({
		id: editId ? editId : uuidv4(),
		role: "user",
		content,
	});

	// Function to dispatch user message
	const dispatchUserMsg = (userMsg: Message) => {
		dispatch({ type: "CHANGE_INPUT", payload: "" });
		dispatch({
			type: "UPSERT_MESSAGE",
			payload: {
				threadId: state.activeThread.id,
				message: userMsg,
			},
		});
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
				temperature: state.activeThread.agentConfig.temperature,
			}),
		})
			.then(async (res) => {
				if (!res.body) {
					throw new Error("No response body from /api/chat");
				}

				const assistantId = uuidv4();
				let tool: string = "";
				let toolInput: string = "";
				let accumulatedResponse = "";
				let finishReason: string | null = null;
				await readStream(res.body, (chunk: string) => {
					const chunks = parseStreamData(chunk);

					toolInput = "";
					accumulatedResponse = chunks.reduce(
						(acc: string, curr: StreamData) => {
							if (!curr) return acc;
							const res = curr.choices[0];
							if (res.finish_reason) {
								finishReason = res.finish_reason;
								return acc;
							}
							if (res.delta.function_call) {
								if (res.delta.function_call.name) {
									tool = res.delta.function_call.name;
								}
								if (res.delta.function_call.arguments) {
									toolInput +=
										res.delta.function_call.arguments;
								}
								return acc;
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
					const { input } = JSON.parse(toolInput);
					const assistantMsg: Message = {
						id: uuidv4(),
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

	// Handler for submitting the chat form
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (state.input.length > 0) {
			const userMsg: Message = createUserMsg(state.input, state.editId);
			dispatchUserMsg(userMsg);

			const msgHistory = state.activeThread.messages;
			if (state.editId) {
				const editIndex = msgHistory.findIndex(
					(msg) => msg.id === state.editId
				);
				msgHistory[editIndex] = userMsg;
			} else {
				msgHistory.push(userMsg);
			}

			getChat(msgHistory);
			fetchTitle();
		}
	};

	// Effect to check stored chat history on component mount
	useEffect(() => {
		if (typeof window === "undefined") return;
		if (isMobile()) {
			state.sideBarOpen = false;
		}

		getChatHistory(state.userId).then((history) => {
			if (history) {
				dispatch({
					type: "INITIALIZE",
					payload: {
						...history,
					},
				});
			}
			setCheckedLocal(true);
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Effect to sync local storage with the chat thread list
	useEffect(() => {
		if (typeof window !== "undefined" && checkedLocal) {
			localStorage.setItem(
				"chatHistory",
				JSON.stringify(state.threadList)
			);
			fetch("/api/save_history", {
				method: "POST",
				body: JSON.stringify({
					chatHistory: state.threadList.map((thread) => ({
						id: thread.id,
						title: thread.title,
						agentConfig: thread.agentConfig,
						messages: JSON.stringify(thread.messages),
					})),
					user: state.userId,
				}),
			})
				.then((res) => {
					if (res.status !== 200) {
						res.text().then((text) => {
							if (text === "No user id") {
								dispatch({
									type: "CHANGE_USER_ID_REQUIRED",
									payload: true,
								});
								dispatch({
									type: "TOGGLE_CONFIG_EDITOR",
									payload: true,
								});
							}
						});
						throw new Error("Failed to save chat history");
					}
				})
				.catch((err) => {
					console.error(err);
				});
		}
	}, [state.threadList, state.threadList.length, checkedLocal, state.userId]);

	if (!checkedLocal) return null;
	return (
		<ChatContext.Provider
			value={{
				...state,
				handleSubmit,
			}}
		>
			<ChatDispatchContext.Provider value={dispatch}>
				{children}
			</ChatDispatchContext.Provider>
		</ChatContext.Provider>
	);
}
