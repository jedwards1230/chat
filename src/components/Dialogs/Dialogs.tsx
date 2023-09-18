'use client';

import { useSession } from 'next-auth/react';

import ConfigEditor from './ConfigEditor';
import CharacterSelector from './CharacterSelector';
import ShareChat from './ShareChat';
import { useUI } from '@/providers/UIProvider';
import OpenAIKey from './OpenAIKey';

export default function Dialogs() {
    const { data: session } = useSession();
    const userId = session?.user?.email;
    const {
        configEditorOpen,
        shareModalOpen,
        characterSelectorOpen,
        openAIKeyOpen,
        signInOpen,
    } = useUI();

    const ActiveDialog = () => {
        /* if (signInOpen && !userId) {
            return <SignIn />;
        } */

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
