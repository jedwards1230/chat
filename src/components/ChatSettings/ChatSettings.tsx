'use client';

import { memo } from 'react';

import { useSession } from 'next-auth/react';

import { useChat } from '@/providers/ChatProvider';
import { Share } from '../Icons';
import { isMobile } from '@/utils/client/device';
import { useUI } from '@/providers/UIProvider';
import AgentSettings from '../AgentSettings';
import { shareThread } from '@/utils/server/supabase';
import { Sidebar } from '../Sidebar';
import useMessages from '@/lib/ChatManagerHook';

function ChatSettings() {
    const { data: session } = useSession();
    const userId = session?.user?.email;
    const { activeThread } = useChat();
    const { chatSettingsOpen, setChatSettingsOpen, setShareModalOpen } =
        useUI();

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

    const messages = useMessages(
        activeThread.currentNode,
        activeThread.mapping,
    );

    return (
        <Sidebar
            pos="right"
            close={() => setChatSettingsOpen(false)}
            open={chatSettingsOpen}
        >
            <div className="flex h-full w-full flex-col pb-3 md:pb-1">
                <div className="flex-1 px-2">
                    <AgentSettings
                        active={true}
                        agent={activeThread.agentConfig}
                    />
                </div>
                {userId && messages.length > 1 && (
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
        </Sidebar>
    );
}

export default memo(ChatSettings);
