'use client';

import AppSettingsDialog from './AppSettings/AppSettingsDialog';
import ShareChat from './ShareChat';
import { useUI } from '@/providers/UIProvider';

export default function Dialogs({ threadId }: { threadId?: string }) {
    const { shareModalOpen } = useUI();

    return (
        <div>
            <AppSettingsDialog />
            {shareModalOpen && threadId && <ShareChat threadId={threadId} />}
        </div>
    );
}
