'use client';

import ConfigEditor from './ConfigEditor';
import ShareChat from './ShareChat';
import { useUI } from '@/providers/UIProvider';

export default function Dialogs() {
    const { configEditorOpen, shareModalOpen } = useUI();
    return (
        <div className="fixed transition-all">
            {configEditorOpen && <ConfigEditor />}
            {shareModalOpen && <ShareChat />}
        </div>
    );
}
