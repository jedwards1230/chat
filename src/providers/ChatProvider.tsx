"use client";

import {
	Dispatch,
	createContext,
	useContext,
	useEffect,
	useReducer,
	useState,
} from "react";

import { isMobile as iM } from "@/utils/client";
import { chatReducer } from "@/providers/chatReducer";
import initialState from "./initialChat";
import { getCloudHistory, saveCloudHistory } from "@/utils/server";
import { serializeSaveData } from "@/utils";

const ChatContext = createContext<ChatState>(initialState);
const ChatDispatchContext = createContext<Dispatch<ChatAction>>(() => {});

export const useChat = () => useContext(ChatContext);
export const useChatDispatch = () => useContext(ChatDispatchContext);

export function ChatProvider({ children }: { children: React.ReactNode }) {
	const [checkedLocal, setCheckedLocal] = useState(false);
	const [isMobile, setIsMobile] = useState(iM() || false);
	const [state, dispatch] = useReducer(chatReducer, {
		...initialState,
		sideBarOpen: !isMobile,
	});

	// Effect to check stored chat history on component mount
	useEffect(() => {
		if (typeof window === "undefined") return;

		getCloudHistory().then((history) => {
			if (history) {
				dispatch({
					type: "INITIALIZE",
					payload: history,
				});
			} else if (typeof window !== "undefined") {
				const storedThreads = localStorage.getItem("chatHistory");
				if (storedThreads) {
					const saveData: SaveData = JSON.parse(storedThreads);
					return saveData;
				}
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
			await saveCloudHistory(saveData);
		} catch (error) {
			console.error(error);
		}
	};

	// Effect to sync local storage with the chat thread list
	useEffect(() => {
		if (typeof window !== "undefined" && checkedLocal && !state.botTyping) {
			const saveData = serializeSaveData({
				config: state.config,
				chatHistory: state.threadList,
			});

			saveHistory(saveData);
		}
	}, [checkedLocal, state.botTyping, state.config, state.threadList]);

	if (!checkedLocal) return null;
	return (
		<ChatContext.Provider value={state}>
			<ChatDispatchContext.Provider value={dispatch}>
				{children}
			</ChatDispatchContext.Provider>
		</ChatContext.Provider>
	);
}
