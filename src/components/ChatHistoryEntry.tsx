"use client";

import { useChatCtx } from "@/providers/ChatProvider";
import clsx from "clsx";
import { Trash } from "./Icons";

export default function ChatHistoryEntry({ entry }: { entry: ChatEntry }) {
	const { activeThread, jumpToChatEntry, removeThread } = useChatCtx();

	return (
		<div
			className={clsx(
				"p-2 flex w-full justify-between items-center",
				entry.id === activeThread.id
					? "bg-neutral-400 dark:bg-neutral-500"
					: "cursor-pointer hover:bg-neutral-600"
			)}
			onClick={() => jumpToChatEntry(entry.id)}
		>
			<div className="flex flex-col max-w-[90%] gap-0 leading-tight">
				<div>{entry.title}</div>
				<div className="text-sm truncate">
					{entry.messages.length > 0 ? entry.messages[0].content : ""}
				</div>
			</div>
			<div
				className="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer select-none hover:bg-neutral-500"
				onClick={() => removeThread(entry.id)}
				title="Delete conversation"
			>
				<Trash />
			</div>
		</div>
	);
}
