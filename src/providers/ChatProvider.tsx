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
	isMobile as iM,
	serializeSaveData,
} from "../utils.client";
import { chatReducer } from "@/providers/chatReducer";
import initialState from "./initialChat";

const ChatContext = createContext<ChatState>(initialState);
const ChatDispatchContext = createContext<Dispatch<ChatAction>>(() => {});

export const useChat = () => useContext(ChatContext);
export const useChatDispatch = () => useContext(ChatDispatchContext);

const MAX_LOOPS = 10;

export function ChatProvider({
	children,
	userId,
}: {
	children: React.ReactNode;
	userId: string | null;
}) {
	const [checkedLocal, setCheckedLocal] = useState(false);
	const [isMobile, setIsMobile] = useState(iM() || false);
	const [state, dispatch] = useReducer(chatReducer, {
		...initialState,
		sideBarOpen: !isMobile,
	});

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

	const getChat = async (
		msgHistory: Message[],
		controller: AbortController,
		loops: number = 0
	) => {
		try {
			if (loops > MAX_LOOPS) {
				throw new Error("Too many loops");
			}
			const signal = controller.signal;
			dispatch({ type: "SET_BOT_TYPING", payload: controller });

			const response = await fetch("/api/chat", {
				method: "POST",
				signal,
				body: JSON.stringify({
					modelName: state.activeThread.agentConfig.model,
					temperature: state.activeThread.agentConfig.temperature,
					tools: state.pluginsEnabled
						? state.activeThread.agentConfig.tools
						: [],
					msgHistory: msgHistory.map((msg) => ({
						content: msg.content,
						role: msg.role,
						name: msg.name,
						function_call: msg.function_call,
					})),
				}),
			});

			if (!response.body) {
				throw new Error("No response body from /api/chat");
			}

			const assistantId = uuidv4();
			let tool: Tool | null = null;
			let toolInput: string = "";
			let accumulatedResponse = "";
			let finishReason: string | null = null;

			const reduceStreamData = (acc: string, curr: StreamData) => {
				if (!curr) return acc;
				const res = curr.choices[0];
				if (res.finish_reason) {
					finishReason = res.finish_reason;
					return acc;
				}
				if (res.delta.function_call) {
					if (res.delta.function_call.name) {
						tool = res.delta.function_call.name as Tool;
					}
					if (res.delta.function_call.arguments) {
						toolInput += res.delta.function_call.arguments;
					}
					return acc;
				}
				return acc + res.delta.content;
			};

			const streamCallback = (chunk: string) => {
				const chunks = parseStreamData(chunk);

				toolInput = "";
				accumulatedResponse = chunks.reduce(reduceStreamData, "");

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
			};

			await readStream(response.body, streamCallback);

			dispatch({ type: "SET_BOT_TYPING" });

			if (tool) {
				let input = "";
				try {
					const cleaned = JSON.parse(toolInput);
					input = cleaned.input;
				} catch (err) {
					input = toolInput;
				}
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

				getChat(msgHistory, controller, loops + 1);
			}
		} catch (error: any) {
			if (error.name === "AbortError") {
				console.log("Fetch aborted");
			} else {
				console.error("Error:", error);
			}
			dispatch({ type: "SET_BOT_TYPING" });
		}
	};

	// Handler for submitting the chat form
	const handleSubmit = (e: React.FormEvent) => {
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

			const controller = new AbortController();

			getChat(msgHistory, controller);
			fetchTitle();
		}
	};

	// Effect to check stored chat history on component mount
	useEffect(() => {
		if (typeof window === "undefined") return;

		getChatHistory(userId!).then((history) => {
			if (history) {
				dispatch({
					type: "INITIALIZE",
					payload: history,
				});
			}
			setCheckedLocal(true);
		});

		const handleResize = () => {
			if (isMobile && !iM()) {
				dispatch({
					type: "SET_SIDEBAR_OPEN",
					payload: false,
				});
				setIsMobile(true);
			} else if (!iM()) {
				dispatch({
					type: "SET_SIDEBAR_OPEN",
					payload: true,
				});
				setIsMobile(false);
			} else {
				dispatch({
					type: "SET_SIDEBAR_OPEN",
					payload: false,
				});
			}
		};

		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
			state.abortController?.abort();
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const saveHistory = async (saveData: string) => {
		try {
			localStorage.setItem("chatHistory", saveData);
			const res = await fetch("/api/save_history", {
				method: "POST",
				body: JSON.stringify({
					saveData,
				}),
			});

			if (!res.ok) {
				throw new Error("Failed to save chat history");
			}
		} catch (error) {
			console.error(error);
		}
	};

	// Effect to sync local storage with the chat thread list
	useEffect(() => {
		if (
			typeof window !== "undefined" &&
			state.threadList.length > 0 &&
			checkedLocal &&
			!state.botTyping
		) {
			const saveData = serializeSaveData({
				config: state.config,
				chatHistory: state.threadList,
			});

			saveHistory(saveData);
		}
	}, [
		state.threadList,
		state.threadList.length,
		checkedLocal,
		state.config,
		state.botTyping,
	]);

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
