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
				"flex transition-colors items-start justify-center py-4 px-2 m-1 border border-transparent dark:hover:border-neutral-600 hover:border-neutral-400/70 rounded",
				message.role === "user"
					? "bg-blue-100 dark:bg-blue-500"
					: "hover:bg-neutral-200/20 dark:bg-neutral-700"
			)}
		>
			<div className="flex items-end h-full justify-end">
				<div
					className={clsx(
						"border rounded w-8 h-8 transition-colors items-center justify-center flex",
						message.role === "user"
							? "bg-neutral-300 dark:bg-neutral-600 dark:border-neutral-400"
							: "bg-green-500 dark:border-neutral-400 text-neutral-900"
					)}
					title={message.role === "user" ? "You" : "Agent"}
				>
					{message.role[0].toUpperCase()}
				</div>
			</div>
			{type === "text" ? (
				<TextBubble message={message.content} />
			) : (
				<FunctionBubble message={message} />
			)}
		</div>
	);
}
