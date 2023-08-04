'use client';

import { useChat } from '@/providers/ChatProvider';
import clsx from 'clsx';
import Link from 'next/link';

export default function QuickActions() {
    const { activeThread, botTyping, abortRequest } = useChat();

    const btn = 'px-3 py-1 rounded-full';

    return (
        <div className="absolute inset-x-0 -top-10 flex justify-center gap-2 text-sm font-medium">
            {botTyping && (
                <button
                    onClick={abortRequest}
                    className={clsx(btn, 'bg-red-500 text-neutral-50')}
                >
                    Stop
                </button>
            )}
            {activeThread.messages.length > 1 && (
                <Link replace={true} href="/">
                    <button
                        className={clsx(
                            btn,
                            'bg-blue-500 text-neutral-50 dark:hover:bg-blue-600',
                        )}
                    >
                        New Chat
                    </button>
                </Link>
            )}
        </div>
    );
}
