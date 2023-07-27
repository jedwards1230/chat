'use client';

import { useChat } from '@/providers/ChatProvider';
import clsx from 'clsx';
import Link from 'next/link';

export default function QuickActions() {
    const { activeThread, botTyping, abortController, abortRequest } =
        useChat();

    const btn = 'px-3 py-1 rounded-full';

    return (
        <div className="absolute inset-x-auto -top-12 flex w-full justify-center gap-2">
            {botTyping && abortController && (
                <button
                    onClick={abortRequest}
                    className={clsx(btn, 'bg-red-500 text-neutral-50')}
                >
                    Stop
                </button>
            )}
            {activeThread.messages.length > 1 && (
                <Link href="/" replace={true}>
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
