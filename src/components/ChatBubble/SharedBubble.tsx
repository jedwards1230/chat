import TextContent from './TextContent';
import SharedProfilePicture from './SharedProfilePicture';
import clsx from 'clsx';

export default function SharedBubble({
    input,
    message,
    config,
}: {
    message: Message;
    input?: string;
    config: AgentConfig;
}) {
    return (
        <div
            className={clsx(
                'group relative w-full rounded px-1 pb-6 pt-4 transition-colors sm:px-2',
                message.role !== 'user'
                    ? 'bg-neutral-200/60 dark:bg-neutral-800/70'
                    : 'border-y dark:border-neutral-700',
            )}
        >
            <div className="mx-auto flex w-full max-w-4xl gap-4 ">
                <SharedProfilePicture message={message} />
                <TextContent message={message} input={input} config={config} />
            </div>
        </div>
    );
}
