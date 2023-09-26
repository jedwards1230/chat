'use client';

import ConfigEditor from './ConfigEditor';
import ShareChat from './ShareChat';
import { useUI } from '@/providers/UIProvider';
import OpenAIKey from './OpenAIKey';

export default function Dialogs() {
    const { configEditorOpen, shareModalOpen, openAIKeyOpen } = useUI();

    const ActiveDialog = () => {
        if (openAIKeyOpen) {
            return <OpenAIKey />;
        }

        if (configEditorOpen) {
            return <ConfigEditor />;
        }

        if (shareModalOpen) {
            return <ShareChat />;
        }

        return null;
    };

    return (
        <div className="fixed z-50 transition-all">
            <ActiveDialog />
        </div>
    );
}
