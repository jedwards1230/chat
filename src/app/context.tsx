"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { getChatHistory, readStream } from "./utils";

export const initialState: State = {
	threadList: [],
	messages: [],
	setMessages: () => {},
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

	const baseEntry: ChatEntry = {
		id: activeThreadId,
		title: "New Chat",
		messages: [],
	};

	// Get chat history from local storage
	// only needed on initial render
	const history = useMemo(() => getChatHistory(), []);

	// Get chat history from local storage, or initialize with default entry
	const [threadList, setThreadList] = useState<ChatEntry[]>(
		history ? history : [baseEntry]
	);

	// Get active thread from local storage, or initialize with default entry
	const active = threadList.find((thread) => thread.id === activeThreadId);
	const [activeThread, setActiveThread] = useState<ChatEntry>(
		active
			? active
			: threadList
			? threadList[threadList.length - 1]
			: baseEntry
	);

	// Get messages from active thread
	const [messages, setMessages] = useState<Message[]>(activeThread.messages);

	const createNewThread = () => {
		if (activeThread.messages.length === 0 && input.length === 0) return;

		const newId = uuidv4();
		setActiveThreadId(newId);
		const newEntry: ChatEntry = {
			id: newId,
			title: "New Chat",
			messages: [] as Message[],
		};
		setThreadList((prevThreadList) => [...prevThreadList, newEntry]);
		setActiveThread(newEntry);
		setMessages([]);
		setInput("");
	};

	// Function to remove a thread and update the local storage
	const removeThread = (id: string) => {
		const newThreadList = threadList.filter((thread) => thread.id !== id);
		setThreadList(newThreadList);

		// set new active thread after removal
		const newActiveThread =
			newThreadList.length > 0
				? newThreadList[newThreadList.length - 1]
				: baseEntry;
		setActiveThread(newActiveThread);
		setActiveThreadId(newActiveThread.id);
	};

	const jumpToChatEntry = (id: string) => {
		setActiveThreadId(id);
		const thread = threadList.find((thread) => thread.id === id);
		if (!thread) {
			throw new Error("Thread not found");
		}
		setActiveThread(thread);
		setMessages(thread.messages);
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

			setMessages((prevMessages) => [...prevMessages, userMsg]);

			setInput("");

			const res = await fetch("/api/chat", {
				method: "POST",
				body: JSON.stringify({
					input,
					msgHistory: messages,
				}),
			});

			if (!res.body) {
				throw new Error("No response body");
			}

			const assistantId = uuidv4(); // Move the ID generation out here

			await readStream(res.body, (chunk: string) => {
				const assistantMsg: Message = {
					id: assistantId, // And reuse it here
					content: chunk,
					role: "assistant",
				};

				// Update thread's messages
				setThreadList((prevThreadList) =>
					prevThreadList.map((thread) =>
						thread.id === assistantId
							? {
									...thread,
									messages: [
										...thread.messages.filter(
											(message) =>
												message.id !== assistantId
										),
										assistantMsg,
									], // Replace previous chunk with current one
							  }
							: thread
					)
				);

				// Update activeThread's messages
				setActiveThread((prevThread) => ({
					...prevThread,
					messages: [
						...prevThread.messages.filter(
							(message) => message.id !== assistantId
						),
						assistantMsg,
					], // Replace previous chunk with current one
				}));

				// Update messages list
				setMessages((prevMessages) => [
					...prevMessages.filter(
						(message) => message.id !== assistantId
					),
					userMsg,
					assistantMsg,
				]); // Replace previous chunk with current one
			});
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		setInput(e.target.value);
	};

	useEffect(() => {
		if (typeof window !== "undefined") {
			localStorage.setItem("chatHistory", JSON.stringify(threadList));
		}
	}, [threadList]);

	return (
		<ChatContext.Provider
			value={{
				threadList,
				messages,
				setMessages,
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
