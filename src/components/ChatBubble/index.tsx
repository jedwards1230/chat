"use client";

import clsx from "clsx";

import TextBubble from "./TextBubble";
import FunctionBubble from "./FunctionBubble";
import { Clipboard, Trash } from "@/components/Icons";
import { useChatCtx, useChatDispatch } from "@/providers/ChatProvider";
import ProfilePicture from "../ProfilePicture";

export default function ChatBubble({ message }: { message: Message }) {
	const { activeThread } = useChatCtx();
	const dispatch = useChatDispatch();

	//if (message.role === "assistant" && message.function_call) return null;
	return (
		<div
			className={clsx(
				"flex relative gap-4 transition-colors group items-start px-2 pt-2 pb-4 justify-start border border-transparent dark:hover:border-neutral-600 hover:border-neutral-400/70 rounded"
			)}
		>
			<ProfilePicture message={message} />
			<div
				className={clsx(
					"flex transition-colors items-start justify-center max-w-full overflow-x-scroll py-2 px-2 rounded",
					message.role === "user"
						? "bg-blue-100 dark:bg-blue-500"
						: "group-hover:bg-neutral-200/60 dark:bg-neutral-700"
				)}
			>
				{message.role === "function" ? (
					<FunctionBubble message={message} />
				) : (
					<TextBubble message={message.content} />
				)}
			</div>
			<div className="absolute bottom-0 hidden gap-4 group-hover:flex right-2">
				<button
					className="p-1 border rounded-full bg-neutral-100 hover:text-red-500 hover:bg-neutral-200 active:bg-neutral-300 border-neutral-400"
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
					className="p-1 border rounded-full bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 border-neutral-400"
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
