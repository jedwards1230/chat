"use client";

import ChatBubble from "./ChatBubble";
import { useChat } from "../providers/ChatProvider";
import Header from "./Header";
import ChatInput from "./ChatInput";

export default function Chat() {
	const { activeThread } = useChat();

	return (
		<div className="flex flex-col items-center w-full h-full">
			<Header />
			<div className="flex flex-col items-center w-full h-full overflow-scroll">
				<div className="flex flex-col w-full h-full max-w-4xl p-2">
					{activeThread.messages.map((m) => (
						<ChatBubble key={m.id + m.content} message={m} />
					))}
				</div>
			</div>
			<ChatInput />
		</div>
	);
}
