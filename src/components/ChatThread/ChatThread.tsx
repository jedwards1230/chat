'use client';

import { useRef, useEffect, useMemo } from 'react';
import clsx from 'clsx';

import ChatPlaceholder from '../ChatPlaceholder';
import { useMessages } from '@/lib/ChatManager';
import ChatGroup from './ChatGroup';

export default function ChatThread({
    style,
    activeThread,
}: {
    style?: React.CSSProperties;
    activeThread?: ChatThread;
}) {
    const messages = useMessages(
        activeThread?.currentNode,
        activeThread?.mapping,
    );

    const threadRef = useRef<HTMLDivElement>(null);
    const prevScrollHeight = useRef<number>(0);

    useEffect(() => {
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
    }, [activeThread?.currentNode, activeThread?.mapping]);

    const hasMultipleMessages = messages.length > 1;

    const groupedMessages = useMemo(() => {
        const grouped: MessageGroup[] = [];

        // helper to add a message to the last group
        const addToLastGroup = (message: Message) => {
            if (grouped.length === 0) {
                grouped.push({ role: message.role, messages: [message] });
            } else {
                grouped[grouped.length - 1].messages.push(message);
            }
        };

        // check if the last message is from the same role
        const eqPrevMsg = (role: Role) =>
            grouped[grouped.length - 1]?.role === role;

        const upsert = (message: Message, r?: Role) => {
            const role = r || message.role;
            if (eqPrevMsg(role)) {
                addToLastGroup(message);
            } else {
                grouped.push({ role: message.role, messages: [message] });
            }
        };

        for (const message of messages) {
            if (message.role === 'function') {
                upsert(message, 'assistant');
            } else {
                upsert(message);
            }
        }

        return grouped;
    }, [messages]);

    return (
        <div
            style={style}
            ref={threadRef}
            className="grow-1 relative flex h-full w-full max-w-full flex-col items-center justify-center overflow-y-scroll"
        >
            <div className="flex h-full w-full flex-col">
                {activeThread?.currentNode ? (
                    groupedMessages.map((group, i) => (
                        <ChatGroup
                            key={i}
                            groupedMessages={group}
                            config={activeThread?.agentConfig}
                        />
                    ))
                ) : (
                    <ChatPlaceholder />
                )}
                {/* Blank row at bottom. Better view of quick actions. */}
                {hasMultipleMessages && <div className="min-h-[72px] w-full" />}
            </div>
        </div>
    );
}
