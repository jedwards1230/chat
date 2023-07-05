"use client";

import { useChat } from "@/providers/ChatProvider";
import ChatBubble from "./ChatBubble";
import { ChatPlaceholder } from "./ChatPlaceholder";

export default function ChatThread() {
	const { activeThread } = useChat();

	return (
		<div className="flex flex-col items-center justify-center w-full h-full max-w-full overflow-y-scroll grow-1">
			<div className="flex flex-col w-full h-full max-w-4xl gap-4 p-2 mx-auto">
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
