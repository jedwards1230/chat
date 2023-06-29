"use client";

import { useChatCtx } from "@/app/context";
import ChatHistoryEntry from "./ChatHistoryEntry";

export default function ChatHistory() {
	const { threadList, createNewThread } = useChatCtx();

	return (
		<div className="flex flex-col items-center justify-start h-full max-w-sm gap-2 py-2 border-r dark:border-neutral-500 w-96 text-neutral-100 bg-neutral-700">
			<button
				className="w-[95%] py-2 transition-colors border rounded-md hover:bg-neutral-500"
				onClick={createNewThread}
			>
				Create New Thread
			</button>
			<div className="flex flex-col-reverse w-full">
				{threadList &&
					threadList.map((m, i) => (
						<ChatHistoryEntry
							key={`${i}-${m.messages.length}`}
							entry={m}
						/>
					))}
			</div>
		</div>
	);
}
