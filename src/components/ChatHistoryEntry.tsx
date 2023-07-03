"use client";

import { useChat, useChatDispatch } from "@/providers/ChatProvider";
import clsx from "clsx";
import { Chat, Trash } from "./Icons";

export default function ChatHistoryEntry({ entry }: { entry: ChatThread }) {
	const { activeThread } = useChat();
	const dispatch = useChatDispatch();

	// Function to remove a thread and update the local storage
	const removeThread = (e: any) => {
		e.stopPropagation();
		dispatch({ type: "REMOVE_THREAD", payload: entry.id });
	};

	return (
		<div
			title={`threadId: ${entry.id}`}
			onClick={() =>
				dispatch({
					type: "CHANGE_ACTIVE_THREAD",
					payload: entry,
				})
			}
			className={clsx(
				"py-2 px-2 gap-2 flex w-full justify-between items-center",
				entry.id === activeThread.id
					? "bg-neutral-400 dark:bg-neutral-500"
					: "cursor-pointer hover:bg-neutral-600"
			)}
		>
			<Chat />
			<div className="flex flex-col w-full gap-0 leading-tight">
				<div className="line-clamp-1">{entry.title}</div>
				<div className="text-sm font-light line-clamp-1">
					{entry.messages.length > 1 ? entry.messages[1].content : ""}
				</div>
			</div>
			<div
				className="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer select-none text-neutral-300 hover:text-neutral-50 hover:bg-neutral-500/50"
				onClick={removeThread}
				title="Delete conversation"
			>
				<Trash />
			</div>
		</div>
	);
}
