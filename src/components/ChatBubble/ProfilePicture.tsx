import clsx from 'clsx';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

export default function ProfilePicture({ role }: { role: Role }) {
    const { data: session } = useSession();
    const user = session?.user;

    return (
        <div className="my-1 flex h-full items-start">
            <div
                className={clsx(
                    'flex h-8 w-8 select-none items-center justify-center overflow-hidden rounded border transition-colors dark:border-neutral-700',
                    role === 'user' && 'bg-neutral-300 dark:bg-neutral-600',
                    role === 'assistant' &&
                        'bg-green-500 text-neutral-900 dark:text-neutral-50',
                    role === 'function' &&
                        'bg-purple-500 text-neutral-900 dark:text-neutral-50',
                )}
                title={
                    role === 'user'
                        ? 'User'
                        : role === 'assistant'
                        ? 'Assistant'
                        : 'Function'
                }
            >
                {role === 'user' && user?.image ? (
                    <Image
                        src={user.image}
                        alt="You"
                        width={32}
                        height={32}
                        className=""
                    />
                ) : (
                    role[0].toUpperCase()
                )}
            </div>
        </div>
    );
}
