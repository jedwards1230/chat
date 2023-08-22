'use client';

import ConfigEditor from './ConfigEditor';
import CharacterSelector from './CharacterSelector';
import ShareChat from './ShareChat';
import { useUI } from '@/providers/UIProvider';
import { useAuth } from '@clerk/nextjs';
import OpenAIKey from './OpenAIKey';
import SignIn from './SignIn';

export default function Dialogs() {
    const { userId } = useAuth();
    const {
        configEditorOpen,
        shareModalOpen,
        characterSelectorOpen,
        openAIKeyOpen,
        signInOpen,
    } = useUI();

    const ActiveDialog = () => {
        if (signInOpen && !userId) {
            return <SignIn />;
        }

        if (openAIKeyOpen) {
            return <OpenAIKey />;
        }

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
        <div className="fixed z-50 transition-all">
            <ActiveDialog />
        </div>
    );
}
