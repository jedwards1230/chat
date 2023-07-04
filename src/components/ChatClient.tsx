"use client";

import { useSwipeable } from "react-swipeable";

import Chat from "./Chat";
import ChatHistory from "./ChatHistory/ChatHistory";
import { useChatDispatch } from "@/providers/ChatProvider";

export default function ChatClient() {
	const dispatch = useChatDispatch();
	const handlers = useSwipeable({
		onSwipedLeft: () =>
			dispatch({ type: "TOGGLE_SIDEBAR", payload: false }),
		onSwipedRight: () =>
			dispatch({ type: "TOGGLE_SIDEBAR", payload: true }),
	});

	return (
		<div className="flex w-full h-full" {...handlers}>
			<ChatHistory />
			<Chat />
		</div>
	);
}
