'use client';

import { memo } from 'react';
import { useSession } from 'next-auth/react';

import { useChat } from '@/providers/ChatProvider';
import { Share } from '../../Icons';
import { isMobile } from '@/utils/client/device';
import { useUI } from '@/providers/UIProvider';
import AgentSettings from './AgentSettings';
import { shareThread } from '@/utils/server/supabase';
import { Sidebar } from '../../Sidebar';
import { Button } from '../../ui/button';

function ChatSettings() {
    const { data: session } = useSession();
    const userId = session?.user?.email;
    const { activeThread, defaultThread } = useChat();
    const thread = activeThread || defaultThread;
    const { chatSettingsOpen, setChatSettingsOpen, setShareModalOpen } =
        useUI();

    const handleShare = async () => {
        try {
            await shareThread(thread);
            setShareModalOpen(true);
            if (isMobile()) {
                setChatSettingsOpen(false);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Sidebar
            pos="right"
            close={() => setChatSettingsOpen(false)}
            open={chatSettingsOpen}
        >
            <div className="flex h-full w-full flex-col pb-3 md:pb-1">
                <div className="flex-1 px-2">
                    <AgentSettings config={thread.agentConfig} />
                </div>
                {userId && activeThread !== undefined && (
                    <Button
                        variant="outlineAccent"
                        className="mx-2"
                        onClick={handleShare}
                    >
                        Share{' '}
                        <span className="scale-[60%]">
                            <Share />
                        </span>
                    </Button>
                )}
            </div>
        </Sidebar>
    );
}

export default memo(ChatSettings);
