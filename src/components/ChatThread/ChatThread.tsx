'use client';

import { useRef, useEffect, useState } from 'react';
import clsx from 'clsx';

import { useChat, useChatDispatch } from '@/providers/ChatProvider';
import { ChatBubble } from './ChatBubble';
import ChatPlaceholder from '../ChatPlaceholder';
import { isMobile } from '@/utils/client';
import { Bars, Settings } from '../Icons';

export default function ChatThread() {
    const { activeThread, sideBarOpen } = useChat();
    const dispatch = useChatDispatch();
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [messages, setMessages] = useState(activeThread.messages);

    const threadRef = useRef<HTMLDivElement>(null);
    let prevScrollHeight = useRef<number>(0);

    const handleSidebarToggle = () => {
        dispatch({ type: 'SET_SIDEBAR_OPEN' });
    };

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
    const isSidebarHidden = sideBarOpen && isMobile();
    const commonButtonClasses =
        'text-neutral-400 z-10 absolute rounded-lg p-2 top-2.5 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-50 cursor-pointer';

    return (
        <div
            ref={threadRef}
            className={clsx(
                'grow-1 relative flex h-full w-full max-w-full flex-col items-center justify-center',
                hasMultipleMessages && 'overflow-y-scroll',
            )}
        >
            {!hasMultipleMessages && (
                <>
                    <button
                        className={clsx(
                            `${commonButtonClasses} left-1`,
                            isSidebarHidden && 'hidden sm:flex',
                        )}
                        onClick={handleSidebarToggle}
                    >
                        <Bars />
                    </button>

                    <button
                        className={clsx(
                            `${commonButtonClasses} right-1`,
                            isSidebarHidden && 'hidden sm:flex',
                        )}
                        onClick={() => setIsConfigOpen(!isConfigOpen)}
                    >
                        <Settings />
                    </button>
                </>
            )}

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
                    <ChatPlaceholder open={isConfigOpen} />
                )}
                {/* Blank row at bottom. Better view of quick actions. */}
                {hasMultipleMessages && <div className="min-h-[72px] w-full" />}
            </div>
        </div>
    );
}
