'use client';

import AppSettingsDialog from './AppSettings/AppSettingsDialog';
import ShareChat from './ShareChat';
import { useUI } from '@/providers/UIProvider';

export default function Dialogs() {
    const { shareModalOpen } = useUI();

    return (
        <div>
            <AppSettingsDialog />
            {shareModalOpen && <ShareChat />}
        </div>
    );
}
