"use client";

import { useChat, useChatDispatch } from "@/providers/ChatProvider";
import clsx from "clsx";
import { Trash } from "./Icons";

export default function ChatHistoryEntry({ entry }: { entry: ChatEntry }) {
	const { activeThread, threadList } = useChat();
	const dispatch = useChatDispatch();

	// Function to remove a thread and update the local storage
	const removeThread = (id: string) => {
		dispatch({ type: "REMOVE_THREAD", payload: id });
		if (threadList.length === 1) {
			dispatch({ type: "CREATE_THREAD" });
		} else {
			dispatch({
				type: "CHANGE_ACTIVE_THREAD",
				payload: threadList[0].id,
			});
		}
	};

	return (
		<div
			className={clsx(
				"p-2 flex w-full justify-between items-center",
				entry.id === activeThread.id
					? "bg-neutral-400 dark:bg-neutral-500"
					: "cursor-pointer hover:bg-neutral-600"
			)}
			onClick={() =>
				dispatch({
					type: "CHANGE_ACTIVE_THREAD",
					payload: entry.id,
				})
			}
		>
			<div className="flex flex-col max-w-[90%] gap-0 leading-tight">
				<div className="line-clamp-1">{entry.title}</div>
				<div className="text-sm line-clamp-1">
					{entry.messages.length > 0 ? entry.messages[0].content : ""}
				</div>
			</div>
			<div
				className="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer select-none text-neutral-300 hover:text-neutral-50 hover:bg-neutral-500/50"
				onClick={() => removeThread(entry.id)}
				title="Delete conversation"
			>
				<Trash />
			</div>
		</div>
	);
}
