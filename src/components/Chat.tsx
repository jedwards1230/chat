"use client";

import ChatHistory from "./ChatHistory/ChatHistory";
import { useChat, useChatDispatch } from "@/providers/ChatProvider";
import clsx from "clsx";
import ChatInput from "./ChatInput";
import ChatThread from "./ChatThread";
import Header from "./Header";
import { useEffect, useState } from "react";
import { PanInfo, motion } from "framer-motion";

export default function Chat() {
	const dispatch = useChatDispatch();
	const { sideBarOpen, activeThread } = useChat();
	const [showHeader, setShowHeader] = useState(
		activeThread.messages.length > 1
	);

	useEffect(() => {
		if (activeThread.messages.length > 1) {
			setShowHeader(true);
		} else {
			setShowHeader(false);
		}
	}, [activeThread.messages.length]);

	function onPan(
		event: MouseEvent | TouchEvent | PointerEvent,
		info: PanInfo
	) {
		if (!sideBarOpen && info.point.x < 300 && info.offset.x > 120) {
			dispatch({ type: "SET_SIDEBAR_OPEN", payload: true });
		} else if (sideBarOpen && info.offset.x < -120) {
			dispatch({ type: "SET_SIDEBAR_OPEN", payload: false });
		}
	}

	return (
		<div className="flex w-full h-full">
			<ChatHistory />
			<motion.div
				onPan={onPan}
				className={clsx(
					"flex flex-col overflow-hidden transition-all w-full h-full",
					sideBarOpen ? "sm:pl-72" : "lg:pl-0"
				)}
			>
				{showHeader && <Header />}
				<ChatThread />
				<ChatInput />
			</motion.div>
		</div>
	);
}
