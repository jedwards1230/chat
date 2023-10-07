'use client';

import clsx from 'clsx';
import Link from 'next/link';

import { useChat } from '@/providers/ChatProvider';
import useMessages from '@/lib/ChatManagerHook';

export default function QuickActions() {
    const { currentThread, threads, botTyping, abortRequest } = useChat();
    const activeThread =
        currentThread !== null ? threads[currentThread] : undefined;
    const messages = useMessages(
        activeThread?.currentNode,
        activeThread?.mapping,
    );

    const btn = 'px-3 py-1.5 rounded';

    if (!activeThread) return null;
    return (
        <div className="absolute inset-x-0 flex justify-end gap-2 px-5 text-sm font-medium -top-10 text-background dark:text-foreground">
            {botTyping && (
                <button
                    onClick={abortRequest}
                    className={clsx(btn, 'bg-red-500')}
                >
                    Stop
                </button>
            )}
            {messages.length > 1 && (
                <>
                    <Link replace={true} href="/">
                        <button
                            className={clsx(
                                btn,
                                'bg-blue-500 hover:bg-blue-400',
                            )}
                        >
                            New Chat
                        </button>
                    </Link>
                </>
            )}
        </div>
    );
}
