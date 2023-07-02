"use client";

import clsx from "clsx";

import TextBubble from "./TextBubble";
import { Clipboard, Trash } from "@/components/Icons";
import { useChat, useChatDispatch } from "@/providers/ChatProvider";
import ProfilePicture from "./ProfilePicture";

export default function ChatBubble({ message }: { message: Message }) {
	const { activeThread } = useChat();
	const dispatch = useChatDispatch();

	return (
		<div
			className={clsx(
				"flex relative gap-4 transition-colors hover:bg-neutral-200/60 dark:hover:bg-neutral-800 group items-start px-2 pt-2 pb-4 justify-start border border-transparent dark:hover:border-neutral-600 hover:border-neutral-400/70 rounded"
			)}
		>
			<ProfilePicture message={message} />
			<TextBubble message={message} />
			<div className="absolute bottom-0 hidden gap-4 group-hover:flex right-2">
				<button
					className="p-1 border rounded-full dark:text-neutral-900 bg-neutral-100 active:bg-neutral-300 dark:active:bg-neutral-400 hover:text-red-500 hover:bg-neutral-200 border-neutral-400"
					title="Delete Message"
					onClick={() => {
						dispatch({
							type: "REMOVE_MESSAGE",
							payload: {
								threadId: activeThread.id,
								messageId: message.id,
							},
						});
					}}
				>
					<Trash />
				</button>
				<button
					className="p-1 border rounded-full bg-neutral-100 hover:bg-neutral-200 dark:text-neutral-900 dark:active:bg-neutral-400 active:bg-neutral-300 border-neutral-400"
					title="Copy"
					onClick={() => {
						navigator.clipboard.writeText(message.content);
					}}
				>
					<Clipboard />
				</button>
			</div>
		</div>
	);
}
