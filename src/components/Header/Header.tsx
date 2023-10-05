'use client';

import clsx from 'clsx';
import { useMemo } from 'react';

import { useChat } from '@/providers/ChatProvider';
import { Bars, Information } from '../Icons';
import ModelSelector from './ModelSelector';
import { useUI } from '@/providers/UIProvider';
import { getTokenCount } from '@/utils/tokenizer';
import useMessages from '@/lib/ChatManagerHook';

export default function Header() {
    const { currentThread, threads } = useChat();
    const activeThread =
        currentThread !== null ? threads[currentThread] : undefined;
    const {
        sideBarOpen,
        setSideBarOpen,
        chatSettingsOpen,
        setChatSettingsOpen,
    } = useUI();

    const messages = useMessages(
        activeThread?.currentNode,
        activeThread?.mapping,
    );

    const tokenCount = useMemo(() => {
        if (messages.length > 1) {
            return messages.reduce(
                (acc, msg) =>
                    msg.content ? acc + getTokenCount(msg.content) : acc,
                0,
            );
        }
        return 0;
    }, [messages]);

    const handleSidebarToggle = () => setSideBarOpen(!sideBarOpen);

    const handleChatSettingsToggle = () =>
        setChatSettingsOpen(!chatSettingsOpen);

    return (
        <div
            className={clsx(
                'grid h-16 w-full shrink-0 grid-cols-12 border-b p-2',
                messages.length > 1
                    ? 'border-neutral-300 shadow dark:border-neutral-500'
                    : 'border-transparent bg-transparent',
            )}
        >
            <div className="flex items-center justify-start col-span-1">
                <button
                    name="sidebar-toggle"
                    className="px-1 cursor-pointer text-neutral-400 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-50"
                    onClick={handleSidebarToggle}
                >
                    <Bars />
                </button>
            </div>
            <div className="flex items-center justify-center col-span-10 text-center">
                {activeThread && messages.length > 1 ? (
                    <div>
                        <p className="font-semibold line-clamp-1">
                            {activeThread.title}
                        </p>
                        <p className="text-sm font-light text-neutral-500">
                            {activeThread.agentConfig.model.name} |{' '}
                            {messages.length} messages | {tokenCount} tokens
                        </p>
                    </div>
                ) : (
                    <div className="pt-1">
                        <ModelSelector />
                    </div>
                )}
            </div>
            <div className="flex items-center justify-end col-span-1">
                <button
                    name="chat-settings-toggle"
                    className="px-1 cursor-pointer text-neutral-400 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-50"
                    onClick={handleChatSettingsToggle}
                >
                    <Information />
                </button>
            </div>
        </div>
    );
}
