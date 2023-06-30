"use client";

import Chat from "./Chat";
import ChatHistory from "./ChatHistory";

export default function ChatClient() {
	return (
		<>
			<ChatHistory />
			<Chat />
		</>
	);
}
