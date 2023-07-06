"use client";

import { useSwipeable } from "react-swipeable";

import ChatHistory from "./ChatHistory/ChatHistory";
import { useChat, useChatDispatch } from "@/providers/ChatProvider";
import clsx from "clsx";
import ChatInput from "./ChatInput";
import ChatThread from "./ChatThread";
import Header from "./Header";

export default function Chat() {
	const { sideBarOpen } = useChat();
	const dispatch = useChatDispatch();
	const handlers = useSwipeable({
		onSwipedLeft: () => {
			if (sideBarOpen)
				dispatch({ type: "SET_SIDEBAR_OPEN", payload: false });
		},
		onSwipedRight: (e) => {
			if (!sideBarOpen && e.absX > 280) {
				dispatch({ type: "SET_SIDEBAR_OPEN", payload: true });
			}
		},
	});

	if (window !== undefined) localStorage.clear();

	return (
		<div className="flex w-full h-full" {...handlers}>
			<ChatHistory />
			<div
				className={clsx(
					"flex flex-col overflow-hidden transition-all w-full h-full",
					sideBarOpen ? "sm:pl-80" : "lg:pl-0"
				)}
			>
				<Header />
				<ChatThread />
				<ChatInput />
			</div>
		</div>
	);
}
