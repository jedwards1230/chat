"use client";

import { useChatCtx } from "@/providers/ChatProvider";
import clsx from "clsx";

export default function ChatHistoryEntry({ entry }: { entry: ChatEntry }) {
	const { activeThread, jumpToChatEntry, removeThread } = useChatCtx();

	return (
		<div
			className={clsx(
				"p-2 flex w-full justify-between",
				entry.id === activeThread.id
					? "bg-neutral-400 dark:bg-neutral-500"
					: "cursor-pointer"
			)}
			onClick={() => jumpToChatEntry(entry.id)}
		>
			<div className="flex flex-col gap-0 leading-tight">
				<div>{entry.title}</div>
				<div className="text-sm truncate">
					{entry.messages.length > 0 ? entry.messages[0].content : ""}
				</div>
			</div>
			<div
				className="flex items-center justify-center w-6 h-6 rounded-full cursor-pointer select-none hover:bg-neutral-500 justify-self-end"
				onClick={() => removeThread(entry.id)}
				title="Delete conversation"
			>
				x
			</div>
		</div>
	);
}
