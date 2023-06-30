"use client";

import {
	createContext,
	useContext,
	useEffect,
	useReducer,
	useState,
} from "react";
import { v4 as uuidv4 } from "uuid";

import { getChatHistory, readStream } from "../app/utils";
import { reducer } from "@/app/reducer";

export const initialState: State = {
	threadList: [],
	input: "",
	activeThread: {
		id: "",
		title: "",
		messages: [],
	},
	handleSubmit: () => {},
	handleInputChange: () => {},
	jumpToChatEntry: () => {},
	createNewThread: () => {},
	removeThread: () => {},
};

const ChatContext = createContext<State>(initialState);

export const useChatCtx = () => useContext(ChatContext);

export function ChatProvider({ children }: { children: React.ReactNode }) {
	const [activeThreadId, setActiveThreadId] = useState(uuidv4());
	const [input, setInput] = useState("");
	const [checkedLocal, setCheckedLocal] = useState(false);

	const baseEntry: ChatEntry = {
		id: activeThreadId,
		title: "New Chat",
		messages: [],
	};

	const [state, dispatch] = useReducer(reducer, {
		...initialState,
		threadList: [baseEntry],
	});

	useEffect(() => {
		const history = getChatHistory();
		if (history) dispatch({ type: "INITIALIZE", payload: history });
		setCheckedLocal(true);
	}, []);

	// Get active thread from local storage, or initialize with default entry
	const active = state.threadList.find(
		(thread) => thread.id === activeThreadId
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
		setActiveThreadId(newId); // todo: needed?
		const newEntry: ChatEntry = {
			id: newId,
			title: "New Chat",
			messages: [] as Message[],
		};
		dispatch({ type: "CREATE_THREAD", payload: newEntry });
		setInput("");
	};

	// Function to remove a thread and update the local storage
	const removeThread = (id: string) => {
		dispatch({ type: "REMOVE_THREAD", payload: id });
		if (state.threadList.length === 1) {
			createNewThread();
		}
	};

	const jumpToChatEntry = (id: string) => {
		setActiveThreadId(id);
		const thread = state.threadList.find((thread) => thread.id === id);
		if (!thread) {
			throw new Error("Thread not found");
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (input.length > 0) {
			const userId = uuidv4();
			const userMsg: Message = {
				id: userId,
				content: input,
				role: "user",
			};

			dispatch({
				type: "UPSERT_MESSAGE",
				payload: {
					threadId: activeThread.id,
					message: userMsg,
				},
			});

			setInput("");

			const res = await fetch("/api/chat", {
				method: "POST",
				body: JSON.stringify({
					input,
					msgHistory: activeThread.messages,
				}),
			});

			if (!res.body) {
				throw new Error("No response body");
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
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		setInput(e.target.value);
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
				input,
				activeThread,
				handleSubmit,
				handleInputChange,
				jumpToChatEntry,
				createNewThread,
				removeThread,
			}}
		>
			{children}
		</ChatContext.Provider>
	);
}
