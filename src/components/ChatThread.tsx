"use client";

import { useChat } from "@/providers/ChatProvider";
import ChatBubble from "./ChatBubble";
import { ChatPlaceholder } from "./ChatPlaceholder";
import { useRef, useEffect } from "react";

export default function ChatThread() {
	const { activeThread } = useChat();
	const threadRef = useRef<HTMLDivElement>(null);
	let prevScrollHeight = useRef<number>(0);

	useEffect(() => {
		const threadEl = threadRef.current;
		if (threadEl) {
			const isAtBottom =
				threadEl.scrollTop + threadEl.clientHeight + 20 >=
				prevScrollHeight.current;

			if (isAtBottom) {
				threadEl.scrollTop = threadEl.scrollHeight;
			}

			prevScrollHeight.current = threadEl.scrollHeight;
		}
	}, [activeThread.messages]);

	return (
		<div
			ref={threadRef}
			className="flex flex-col items-center justify-center w-full h-full max-w-full overflow-y-scroll grow-1"
		>
			<div className="flex flex-col w-full h-full gap-4 p-2 mx-auto lg:max-w-4xl">
				{activeThread.messages.length > 1 ? (
					activeThread.messages.map((m) => (
						<ChatBubble key={m.id} message={m} />
					))
				) : (
					<ChatPlaceholder />
				)}
			</div>
		</div>
	);
}
