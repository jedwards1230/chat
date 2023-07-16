'use client';

import { useChat } from '@/providers/ChatProvider';
import ConfigEditor from './ConfigEditor';
import ShareChat from './ShareChat';

export default function Dialogs() {
    const { configEditorOpen, shareModalOpen } = useChat();
    return (
        <div className="h-full w-full transition-all">
            {configEditorOpen && <ConfigEditor />}
            {shareModalOpen && <ShareChat />}
        </div>
    );
}
