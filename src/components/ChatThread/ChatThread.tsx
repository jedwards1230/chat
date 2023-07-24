'use client';

import { useRef, useEffect, useState } from 'react';
import clsx from 'clsx';

import { ChatBubble } from './ChatBubble';
import ChatPlaceholder from '../ChatPlaceholder';

export default function ChatThread({
    style,
    activeThread,
}: {
    style?: React.CSSProperties;
    activeThread: ChatThread;
}) {
    const [messages, setMessages] = useState(activeThread.messages);

    const threadRef = useRef<HTMLDivElement>(null);
    const prevScrollHeight = useRef<number>(0);

    useEffect(() => {
        setMessages(activeThread.messages);

        const threadEl = threadRef.current;
        if (!threadEl) return;

        const isAtBottom =
            threadEl.scrollTop + threadEl.clientHeight + 20 >=
            prevScrollHeight.current;

        if (isAtBottom) {
            threadEl.scrollTo({
                top: threadEl.scrollHeight,
                behavior: 'smooth',
            });
        }

        prevScrollHeight.current = threadEl.scrollHeight;
    }, [activeThread.messages]);

    const hasMultipleMessages = activeThread.messages.length > 1;

    return (
        <div
            style={style}
            ref={threadRef}
            className={clsx(
                'grow-1 relative flex h-full w-full max-w-full flex-col items-center justify-center',
                hasMultipleMessages && 'overflow-y-scroll',
            )}
        >
            <div className="flex h-full w-full flex-col">
                {hasMultipleMessages ? (
                    messages.map((m, i) => {
                        if (m.role === 'assistant' && m.function_call) {
                            return null;
                        }
                        const lastMessage = messages[i - 1];
                        return (
                            <ChatBubble
                                key={m.id}
                                message={m}
                                config={activeThread.agentConfig}
                                input={
                                    m.role === 'function' &&
                                    lastMessage.function_call &&
                                    lastMessage.function_call.arguments
                                        ? lastMessage.function_call.arguments
                                        : undefined
                                }
                            />
                        );
                    })
                ) : (
                    <ChatPlaceholder />
                )}
                {/* Blank row at bottom. Better view of quick actions. */}
                {hasMultipleMessages && <div className="min-h-[72px] w-full" />}
            </div>
        </div>
    );
}
