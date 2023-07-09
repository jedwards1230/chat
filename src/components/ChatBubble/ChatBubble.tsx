"use client";

import ProfilePicture from "./ProfilePicture";
import { ChatBubbleFunctionList } from "./ChatBubbleFunctionList";
import { useEffect, useState } from "react";
import TextContent from "./TextContent";

export default function ChatBubble({
	message,
	config,
}: {
	message: Message;
	config: AgentConfig;
}) {
	const [messageInfo, setMessage] = useState<Message>(message);

	useEffect(() => {
		setMessage(message);
	}, [message]);

	return (
		<div className="relative flex gap-4 px-1 pt-2 pb-4 transition-colors border border-transparent rounded sm:px-2 group dark:hover:border-neutral-700 hover:border-neutral-400/70">
			<ProfilePicture message={messageInfo} />
			<TextContent message={messageInfo} config={config} />
			<ChatBubbleFunctionList message={messageInfo} />
		</div>
	);
}
