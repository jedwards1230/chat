import TextContent from "./TextContent";
import SharedProfilePicture from "./SharedProfilePicture";

export default function SharedBubble({
	message,
	config,
}: {
	message: Message;
	config: AgentConfig;
}) {
	return (
		<div className="relative flex gap-4 px-1 pt-2 pb-4 transition-colors border border-transparent rounded sm:px-2 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 group dark:hover:border-neutral-600 hover:border-neutral-400/70">
			<SharedProfilePicture message={message} />
			<TextContent message={message} config={config} />
		</div>
	);
}
