"use client";

import TextBubble from "./TextContent";
import ProfilePicture from "./ProfilePicture";
import { ChatBubbleFunctionList } from "./ChatBubbleFunctionList";
import { useEffect, useState } from "react";

export default function ChatBubble({ message }: { message: Message }) {
	const [messageInfo, setMessage] = useState<Message>(message);

	useEffect(() => {
		setMessage(message);
	}, [message]);

	return (
		<div className="relative flex gap-4 px-1 pt-2 pb-4 transition-colors border border-transparent rounded sm:px-2 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 group dark:hover:border-neutral-600 hover:border-neutral-400/70">
			<ProfilePicture message={messageInfo} />
			<TextBubble message={messageInfo} />
			<ChatBubbleFunctionList message={messageInfo} />
		</div>
	);
}
