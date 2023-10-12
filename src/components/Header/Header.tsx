'use client';

import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';

import { useChat } from '@/providers/ChatProvider';
import { Bars, Information } from '../Icons';
import ModelSelector from './ModelSelector';
import { useUI } from '@/providers/UIProvider';
import { getTokenCount } from '@/utils/tokenizer';
import useMessages from '@/lib/ChatManagerHook';
import { Button } from '../ui/button';

export default function Header() {
    const { activeThread } = useChat();
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

    const [tokenCount, setTokenCount] = useState(0);

    useEffect(() => {
        (async () => {
            let total = 0;
            if (messages.length > 1) {
                for (const msg of messages) {
                    if (msg.content) {
                        total += await getTokenCount(msg.content);
                    }
                }
            }
            setTokenCount(total);
        })();
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
            <div className="col-span-1 flex items-center justify-start">
                <Button
                    size="icon"
                    variant="ghost"
                    name="sidebar-toggle"
                    onClick={handleSidebarToggle}
                >
                    <Bars />
                </Button>
            </div>
            <div className="col-span-10 flex items-center justify-center text-center">
                {activeThread && messages.length > 1 ? (
                    <div>
                        <p className="line-clamp-1 font-semibold">
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
            <div className="col-span-1 flex items-center justify-end">
                <Button
                    size="icon"
                    variant="ghost"
                    name="chat-settings-toggle"
                    onClick={handleChatSettingsToggle}
                >
                    <Information />
                </Button>
            </div>
        </div>
    );
}
