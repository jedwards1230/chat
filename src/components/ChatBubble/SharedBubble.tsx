import TextContent from './TextContent';
import SharedProfilePicture from './SharedProfilePicture';

export default function SharedBubble({
    message,
    config,
}: {
    message: Message;
    config: AgentConfig;
}) {
    return (
        <div className="group relative flex gap-4 rounded border border-transparent px-1 pb-4 pt-2 transition-colors hover:border-neutral-400/70 hover:bg-neutral-200/60 dark:hover:border-neutral-600 dark:hover:bg-neutral-800 sm:px-2">
            <SharedProfilePicture message={message} />
            <TextContent message={message} config={config} />
        </div>
    );
}
