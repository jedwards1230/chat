import clsx from 'clsx';

export default function SharedProfilePicture({
    message,
}: {
    message: Message;
}) {
    return (
        <div className="my-1 flex h-full items-start justify-end">
            <div
                className={clsx(
                    'flex h-8 w-8 select-none items-center justify-center overflow-hidden rounded border transition-colors dark:border-neutral-500/80',
                    message.role === 'user' &&
                        'bg-neutral-300 dark:bg-neutral-600',
                    message.role === 'assistant' &&
                        'bg-green-500 text-neutral-900 dark:text-neutral-50',
                    message.role === 'function' &&
                        'bg-purple-500 text-neutral-900 dark:text-neutral-50',
                )}
                title={
                    message.role === 'user'
                        ? 'User'
                        : message.role === 'assistant'
                        ? 'Assistant'
                        : 'Function'
                }
            >
                {message.role[0].toUpperCase()}
            </div>
        </div>
    );
}
