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

import { getChatHistory, readStream } from "../utils";
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
	jumpToChatEntry: () => {},
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
		threadList: [
			{
				...baseEntry,
			},
		],
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

	const createNewThread = () => {
		const newId = uuidv4();
		const newEntry: ChatEntry = {
			...baseEntry,
			id: newId,
		};
		dispatch({
			type: "CHANGE_ACTIVE_THREAD",
			payload: newId,
		});
		dispatch({ type: "CREATE_THREAD", payload: newEntry });
		dispatch({ type: "CHANGE_INPUT", payload: "" });
	};

	const jumpToChatEntry = (id: string) => {
		dispatch({
			type: "CHANGE_ACTIVE_THREAD",
			payload: id,
		});

		const thread = state.threadList.find((thread) => thread.id === id);
		if (!thread) {
			throw new Error("Thread not found");
		}
	};

	// Function to remove a thread and update the local storage
	const removeThread = (id: string) => {
		dispatch({ type: "REMOVE_THREAD", payload: id });
		if (state.threadList.length === 1) {
			createNewThread();
		} else {
			jumpToChatEntry(state.threadList[0].id);
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
					threadId: activeThread.id,
					message: userMsg,
				},
			});

			dispatch({ type: "CHANGE_INPUT", payload: "" });

			fetch("/api/chat", {
				method: "POST",
				body: JSON.stringify({
					input: state.input,
					msgHistory: activeThread.messages,
					modelName: activeThread.agentConfig.model,
				}),
			})
				.then(async (res) => {
					if (!res.body) {
						throw new Error("No response body from /api/chat");
					}

					const assistantId = uuidv4();

					await readStream(res.body, (chunk: string) => {
						const assistantMsg: Message = {
							id: assistantId,
							content: chunk,
							role: "assistant",
						};

						dispatch({
							type: "UPSERT_MESSAGE",
							payload: {
								threadId: activeThread.id,
								message: assistantMsg,
							},
						});
					});
				})
				.catch((err) => {
					console.error(err);
				});

			const l = activeThread.messages.length;
			if (l < 2 || l > 10) return;
			const history = activeThread.messages.map(
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
								threadId: activeThread.id,
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

	if (state.threadList.length === 0) createNewThread();
	return (
		<ChatContext.Provider
			value={{
				threadList: state.threadList,
				input: state.input,
				activeThread,
				activeThreadId: state.activeThreadId,
				handleSubmit,
				jumpToChatEntry,
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
