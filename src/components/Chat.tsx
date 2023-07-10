"use client";

import { useSwipeable } from "react-swipeable";

import ChatHistory from "./ChatHistory/ChatHistory";
import { useChat, useChatDispatch } from "@/providers/ChatProvider";
import clsx from "clsx";
import ChatInput from "./ChatInput";
import ChatThread from "./ChatThread";
import Header from "./Header";
import { useEffect, useState } from "react";

export default function Chat() {
	const { sideBarOpen, activeThread } = useChat();
	const [showHeader, setShowHeader] = useState(
		activeThread.messages.length > 1
	);
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

	useEffect(() => {
		if (activeThread.messages.length > 1) {
			setShowHeader(true);
		} else {
			setShowHeader(false);
		}
	}, [activeThread.messages.length]);

	return (
		<div className="flex w-full h-full" {...handlers}>
			<ChatHistory />
			<div
				className={clsx(
					"flex flex-col overflow-hidden transition-all w-full h-full",
					sideBarOpen ? "sm:pl-72" : "lg:pl-0"
				)}
			>
				{showHeader && <Header />}
				<ChatThread />
				<ChatInput />
			</div>
		</div>
	);
}
