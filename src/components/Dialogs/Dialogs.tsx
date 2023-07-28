'use client';

import ConfigEditor from './ConfigEditor';
import PersonalitySelector from './PersonalitySelector';
import ShareChat from './ShareChat';
import { useUI } from '@/providers/UIProvider';

export default function Dialogs() {
    const { configEditorOpen, shareModalOpen, personalitySelectorOpen } =
        useUI();

    const ActiveDialog = () => {
        if (personalitySelectorOpen) {
            return <PersonalitySelector />;
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
        <div className="fixed transition-all">
            <ActiveDialog />
        </div>
    );
}
