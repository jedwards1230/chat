"use client";

import clsx from "clsx";
import TextBubble from "./TextBubble";
import FunctionBubble from "./FunctionBubble";

export default function ChatBubble({
	message,
	type,
}: {
	message: Message;
	type: "text" | "function";
}) {
	return (
		<div
			className={clsx(
				"flex gap-2 md:gap-4 transition-colors items-start p-2 justify-start border border-transparent dark:hover:border-neutral-600 hover:border-neutral-400/70 rounded"
			)}
		>
			<div className="flex items-end h-full my-1 justify-end">
				<div
					className={clsx(
						"border rounded w-8 h-8 transition-colors items-center justify-center flex",
						message.role === "user"
							? "bg-neutral-300 dark:bg-neutral-600 dark:border-neutral-400"
							: message.role === "assistant"
							? "bg-green-500 dark:border-neutral-400 text-neutral-900 dark:text-neutral-50"
							: "bg-purple-500 dark:border-neutral-400 text-neutral-900 dark:text-neutral-50"
					)}
					title={message.role === "user" ? "You" : "Agent"}
				>
					{message.role[0].toUpperCase()}
				</div>
			</div>
			<div
				className={clsx(
					"flex transition-colors items-start justify-center w-full py-2 px-2 rounded",
					message.role === "user"
						? "bg-blue-100 dark:bg-blue-500"
						: "hover:bg-neutral-200/40 dark:bg-neutral-700"
				)}
			>
				{type === "text" ? (
					<TextBubble message={message.content} />
				) : (
					<FunctionBubble message={message} />
				)}
			</div>
		</div>
	);
}
