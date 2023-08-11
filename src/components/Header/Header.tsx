'use client';

import { useChat } from '@/providers/ChatProvider';
import { Bars, Information } from '../Icons';
import clsx from 'clsx';
import { isMobile } from '@/utils/client';
import ModelSelector from './ModelSelector';
import { useUI } from '@/providers/UIProvider';

export default function Header() {
    const { activeThread } = useChat();
    const {
        sideBarOpen,
        setSideBarOpen,
        chatSettingsOpen,
        setChatSettingsOpen,
    } = useUI();

    const handleSidebarToggle = () => {
        setSideBarOpen(!sideBarOpen);
    };

    const handleChatSettingsToggle = () => {
        setChatSettingsOpen(!chatSettingsOpen);
    };

    return (
        <div
            className={clsx(
                'grid h-16 w-full shrink-0 grid-cols-12 border-b p-2',
                activeThread.messages.length > 1
                    ? 'border-neutral-300 shadow dark:border-neutral-500'
                    : 'border-transparent bg-transparent',
            )}
        >
            <div className="col-span-1 flex items-center justify-start">
                <button
                    name="sidebar-toggle"
                    className={clsx(
                        'cursor-pointer px-1 text-neutral-400 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-50',
                        sideBarOpen && 'hidden sm:block',
                    )}
                    onClick={handleSidebarToggle}
                >
                    <Bars />
                </button>
            </div>
            <div className="col-span-10 text-center">
                {activeThread.messages.length > 1 ? (
                    <>
                        <p className="line-clamp-1 font-semibold">
                            {activeThread.title}
                        </p>
                        <p className="text-sm font-light text-neutral-500">
                            {activeThread.agentConfig.model} |{' '}
                            {activeThread.messages.length} messages
                        </p>
                    </>
                ) : (
                    <ModelSelector />
                )}
            </div>
            <div className="col-span-1 flex items-center justify-end">
                <button
                    name="chat-settings-toggle"
                    className={clsx(
                        'cursor-pointer px-1 text-neutral-400 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-50',
                        chatSettingsOpen && isMobile() && 'hidden sm:block',
                    )}
                    onClick={handleChatSettingsToggle}
                >
                    <Information />
                </button>
            </div>
        </div>
    );
}
