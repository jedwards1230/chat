'use client';

import ConfigEditor from './ConfigEditor';
import CharacterSelector from './CharacterSelector';
import ShareChat from './ShareChat';
import { useUI } from '@/providers/UIProvider';

export default function Dialogs() {
    const { configEditorOpen, shareModalOpen, characterSelectorOpen } = useUI();

    const ActiveDialog = () => {
        if (characterSelectorOpen) {
            return <CharacterSelector />;
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
