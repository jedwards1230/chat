import clsx from "clsx";

export default function SharedProfilePicture({
	message,
}: {
	message: Message;
}) {
	return (
		<div className="flex items-start justify-end h-full my-1">
			<div
				className={clsx(
					"border rounded overflow-hidden w-8 h-8 select-none transition-colors dark:border-neutral-500/80 items-center justify-center flex",
					message.role === "user" &&
						"bg-neutral-300 dark:bg-neutral-600",
					message.role === "assistant" &&
						"bg-green-500 text-neutral-900 dark:text-neutral-50",
					message.role === "function" &&
						"bg-purple-500 text-neutral-900 dark:text-neutral-50"
				)}
				title={
					message.role === "user"
						? "User"
						: message.role === "assistant"
						? "Assistant"
						: "Function"
				}
			>
				{message.role[0].toUpperCase()}
			</div>
		</div>
	);
}
