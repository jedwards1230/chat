import clsx from 'clsx';

export default function ChatBubbleFunction({
    title,
    onClick,
    icon,
    color,
}: {
    title: string;
    onClick: () => void;
    icon: JSX.Element;
    color?: 'red' | 'blue' | 'green';
}) {
    return (
        <button
            className={clsx(
                'scale-[85%] rounded-full border border-neutral-400 bg-neutral-100 p-1 hover:bg-neutral-200 active:bg-neutral-300 dark:bg-neutral-300 dark:text-neutral-900 dark:hover:bg-neutral-200 dark:active:bg-neutral-400',
                color === 'red' && 'hover:text-red-500',
                color === 'blue' && 'hover:text-blue-500',
                color === 'green' && 'hover:text-green-600',
            )}
            title={title}
            onClick={onClick}
        >
            {icon}
        </button>
    );
}
