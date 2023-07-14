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
			if (text && text !== `""`) {
				inputDisplay = `[${text}](${url})`;
			} else if (url.slice(-1) === ",") {
				inputDisplay = url.slice(0, -1);
			} else {
				inputDisplay = url;
			}
		}

		return (
			<details className="flex flex-col items-start w-full rounded">
				<summary className="w-full gap-2 p-2 capitalize rounded-lg cursor-pointer text-ellipsis hover:bg-neutral-300 dark:hover:bg-neutral-700">
					<div className="inline-block align-middle">
						{message.name}:
					</div>{" "}
					<div className="inline-block overflow-x-scroll align-middle">
						<Markdown content={inputDisplay} />
					</div>
				</summary>
				<div className="mt-4 line-clamp-1">
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
