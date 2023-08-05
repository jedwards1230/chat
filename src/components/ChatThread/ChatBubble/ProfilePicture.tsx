import { useUser } from '@clerk/nextjs';
import clsx from 'clsx';
import Image from 'next/image';

export default function ProfilePicture({ message }: { message: Message }) {
    const { user } = useUser();

    return (
        <div className="my-1 flex h-full items-start">
            <div
                className={clsx(
                    'flex h-8 w-8 select-none items-center justify-center overflow-hidden rounded border transition-colors dark:border-neutral-700',
                    message.role === 'user' &&
                        'bg-neutral-300 dark:bg-neutral-600',
                    message.role === 'assistant' &&
                        'bg-green-500 text-neutral-900 dark:text-neutral-50',
                    message.role === 'function' &&
                        'bg-purple-500 text-neutral-900 dark:text-neutral-50',
                )}
                title={
                    message.role === 'user'
                        ? 'You'
                        : message.role === 'assistant'
                        ? 'Assistant'
                        : 'Function'
                }
            >
                {message.role === 'user' && user?.imageUrl ? (
                    <Image
                        src={user.imageUrl}
                        alt="You"
                        width={32}
                        height={32}
                        className=""
                    />
                ) : (
                    message.role[0].toUpperCase()
                )}
            </div>
        </div>
    );
}
