import Markdown from "../Markdown";

export default function TextContent({
	message,
	input,
	config,
}: {
	message: Message;
	input?: string;
	config: AgentConfig;
}) {
	const content =
		message.name && message.role !== "function"
			? `${message.name[0].toUpperCase() + message.name.substring(1)}: ${
					message.content
			  }`
			: message.content;

	const FunctionContent = () => {
		const mdContent = `\`\`\`md\n${content}\`\`\``;

		return (
			<details
				className={"flex flex-col gap-4 items-start w-full rounded"}
			>
				<summary className="capitalize cursor-pointer">
					{message.name}: {input}
				</summary>
				<Markdown content={mdContent} />
			</details>
		);
	};

	const SystemContent = () => (
		<div className="flex flex-col justify-start w-full text-xs rounded text-neutral-400 dark:text-neutral-500">
			<div>Model: {config.model}</div>
			<div>System Message: {message.content}</div>
			{config.tools.length > 0 && (
				<div className="capitalize">
					Plugins: {config.tools.join(" | ")}
				</div>
			)}
		</div>
	);

	return (
		<div className="flex flex-col w-full px-2 py-2 overflow-x-scroll transition-colors rounded">
			{message.role === "function" ? (
				<FunctionContent />
			) : message.role === "system" ? (
				<SystemContent />
			) : (
				<Markdown content={content} />
			)}
		</div>
	);
}
