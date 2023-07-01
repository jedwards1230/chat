"use client";

import ChatBubble from "./ChatBubble";
import { useChatCtx } from "../providers/ChatProvider";
import Header from "./Header";
import ChatInput from "./ChatInput";

export default function Chat() {
	const { activeThread } = useChatCtx();

	return (
		<div className="flex flex-col items-center w-full h-full">
			<Header />
			<div className="flex flex-col items-center w-full h-full overflow-scroll">
				<div className="w-full h-full max-w-4xl p-2">
					{activeThread.messages.map((m) => (
						<ChatBubble key={m.id} message={m} type={"text"} />
					))}
				</div>
			</div>
			<ChatInput />
		</div>
	);
}
