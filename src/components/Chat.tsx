"use client";

import ChatBubble from "./ChatBubble";
import { useChatCtx } from "../providers/ChatProvider";
import Header from "./Header";
import ChatInput from "./ChatInput";

export default function Chat() {
	const { activeThread } = useChatCtx();

	return (
		<div className="flex flex-col w-full h-full ">
			<Header />
			<div className="flex-1 p-2 overflow-scroll">
				{activeThread.messages.map((m) => (
					<ChatBubble key={m.id} role={m.role} content={m.content} />
				))}
			</div>
			<ChatInput />
		</div>
	);
}
