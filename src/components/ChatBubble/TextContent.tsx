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

		let inputDisplay = input;
		if (message.name === "web-browser" && input) {
			// parse this string into two
			// `https://nextjs.org/docs/pages/building-your-application/upgrading/version-13, ""`
			// `https://nextjs.org/docs/app/building-your-application/upgrading/version-13, "Node.js"`
			const [url, text] = input.split(", ");
			inputDisplay = text && text !== `""` ? `[${text}](${url})` : url;
		}

		return (
			<details className="flex flex-col items-start w-full rounded">
				<summary className="flex gap-2 p-2 capitalize rounded-lg cursor-pointer hover:bg-neutral-300">
					{message.name}: <Markdown content={inputDisplay} />
				</summary>
				<div className="mt-4">
					<Markdown content={mdContent} />
				</div>
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
