"use client";

import { useChat } from "@/providers/ChatProvider";

export default function Title() {
	const { activeThread } = useChat();

	return (
		<div className="absolute inset-x-auto inset-y-auto flex flex-col items-center justify-center h-full gap-2">
			<div className="text-4xl font-medium text-center">
				{activeThread.agentConfig.name}
			</div>
			<div className="italic text-neutral-500 line-clamp-1">
				System: {activeThread.agentConfig.systemMessage}
			</div>
		</div>
	);
}
