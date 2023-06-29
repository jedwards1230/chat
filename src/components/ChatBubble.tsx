import clsx from "clsx";

export default function ChatBubble({
	children,
	role,
}: {
	children: React.ReactNode;
	role: "system" | "user" | "assistant" | "function";
}) {
	return (
		<div
			className={clsx(
				"flex flex-col items-start justify-center py-1 px-2 m-1 border border-transparent dark:hover:border-neutral-600 hover:border-neutral-400/90 rounded",
				role === "user"
					? "bg-blue-100 dark:bg-blue-500"
					: "bg-neutral-100 dark:bg-neutral-700"
			)}
		>
			{children}
		</div>
	);
}
