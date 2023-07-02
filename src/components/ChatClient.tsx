"use client";

import { useSwipeable } from "react-swipeable";

import Chat from "./Chat";
import ChatHistory from "./ChatHistory";
import { useConfigDispatch } from "@/providers/ConfigProvider";

export default function ChatClient() {
	const dispatch = useConfigDispatch();
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
