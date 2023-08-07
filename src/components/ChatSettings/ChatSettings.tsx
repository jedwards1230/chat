'use client';

import clsx from 'clsx';
import { useEffect, useRef } from 'react';

import { useChat } from '@/providers/ChatProvider';
import { Share } from '../Icons';
import { isMobile } from '@/utils/client';
import { useUI } from '@/providers/UIProvider';
import AgentSettings from '../AgentSettings';
import { shareThread } from '@/utils/server/supabase';

export default function ChatSettings() {
    const { activeThread } = useChat();
    const { chatSettingsOpen, setChatSettingsOpen, setShareModalOpen } =
        useUI();
    const chatsettingsRef = useRef<HTMLDivElement>(null);

    const handleShare = async () => {
        try {
            await shareThread(activeThread);
            setShareModalOpen(true);
            if (isMobile()) {
                setChatSettingsOpen(false);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (
                chatSettingsOpen &&
                isMobile('md') &&
                chatsettingsRef.current &&
                !chatsettingsRef.current.contains(event.target)
            ) {
                event.preventDefault();
                setChatSettingsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            ref={chatsettingsRef}
            className={clsx(
                'fixed right-0 z-50 h-full w-72 min-w-[270px] max-w-xs border-l bg-neutral-800 py-2 text-neutral-100 transition-all dark:border-neutral-500 sm:z-auto lg:inset-y-0 lg:flex',
                chatSettingsOpen ? 'translate-x-0' : 'translate-x-full',
            )}
        >
            <div className="flex h-full w-full flex-col pb-6 md:pb-0">
                <div className="flex-1">
                    <AgentSettings
                        active={true}
                        agent={activeThread.agentConfig}
                    />
                </div>
                {activeThread.messages.length > 1 && (
                    <button
                        className="mx-2 flex items-center justify-center rounded-lg border border-neutral-500 py-2 font-medium transition-colors hover:border-neutral-400 hover:bg-neutral-600 dark:hover:bg-neutral-700"
                        onClick={handleShare}
                    >
                        Share{' '}
                        <span className="scale-[60%]">
                            <Share />
                        </span>
                    </button>
                )}
            </div>
        </div>
    );
}
