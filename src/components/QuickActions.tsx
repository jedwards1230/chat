'use client';

import { useChat } from '@/providers/ChatProvider';
import clsx from 'clsx';
import Link from 'next/link';

export default function QuickActions() {
    const { activeThread, botTyping, abortRequest } = useChat();

    const btn = 'px-3 py-1.5 rounded';

    return (
        <div className="absolute inset-x-0 flex justify-end gap-2 px-5 text-sm font-medium text-background dark:text-foreground -top-10">
            {botTyping && (
                <button
                    onClick={abortRequest}
                    className={clsx(btn, 'bg-red-500')}
                >
                    Stop
                </button>
            )}
            {activeThread.messages.length > 1 && (
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
