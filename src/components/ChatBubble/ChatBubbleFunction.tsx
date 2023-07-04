import clsx from "clsx";

export default function ChatBubbleFunction({
	title,
	onClick,
	icon,
	color,
}: {
	title: string;
	onClick: () => void;
	icon: JSX.Element;
	color?: "red" | "blue";
}) {
	return (
		<button
			className={clsx(
				"p-1 border rounded-full dark:text-neutral-900 bg-neutral-100 active:bg-neutral-300 dark:active:bg-neutral-400 hover:bg-neutral-200 border-neutral-400",
				color === "red" && "hover:text-red-500",
				color === "blue" && "hover:text-blue-500"
			)}
			title={title}
			onClick={onClick}
		>
			{icon}
		</button>
	);
}
