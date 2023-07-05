"use client";

import { useChat } from "@/providers/ChatProvider";

export default function QuickActions() {
	const { botTyping, abortController } = useChat();

	return (
		<div className="absolute inset-x-auto flex justify-center w-full -top-12">
			{botTyping && abortController && (
				<button
					onClick={() => abortController.abort()}
					className="px-3 py-1 bg-red-500 rounded-full text-neutral-50"
				>
					Stop
				</button>
			)}
		</div>
	);
}
