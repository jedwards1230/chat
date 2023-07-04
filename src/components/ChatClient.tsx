"use client";

import { useSwipeable } from "react-swipeable";

import Chat from "./Chat";
import ChatHistory from "./ChatHistory/ChatHistory";
import { useChat, useChatDispatch } from "@/providers/ChatProvider";

export default function ChatClient() {
	const { sideBarOpen } = useChat();
	const dispatch = useChatDispatch();
	const handlers = useSwipeable({
		onSwipedLeft: () => {
			if (sideBarOpen)
				dispatch({ type: "TOGGLE_SIDEBAR", payload: false });
		},
		onSwipedRight: (e) => {
			if (!sideBarOpen && e.absX > 280) {
				dispatch({ type: "TOGGLE_SIDEBAR", payload: true });
			}
		},
	});

	return (
		<div className="flex w-full h-full" {...handlers}>
			<ChatHistory />
			<Chat />
		</div>
	);
}
