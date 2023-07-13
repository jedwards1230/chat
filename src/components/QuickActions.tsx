"use client";

import { useChat, useChatDispatch } from "@/providers/ChatProvider";
import clsx from "clsx";

export default function QuickActions() {
	const { activeThread, botTyping, abortController } = useChat();
	const dispatch = useChatDispatch();

	const btn = "px-3 py-1 rounded-full";

	return (
		<div className="absolute inset-x-auto flex justify-center w-full -top-12">
			{botTyping && abortController && (
				<button
					onClick={() => abortController.abort()}
					className={clsx(btn, "bg-red-500 text-neutral-50")}
				>
					Stop
				</button>
			)}
			{activeThread.messages.length > 1 && (
				<button
					onClick={() => dispatch({ type: "CREATE_THREAD" })}
					className={clsx(btn, "bg-blue-500 text-neutral-50")}
				>
					New Chat
				</button>
			)}
		</div>
	);
}
