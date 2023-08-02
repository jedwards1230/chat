'use client';

import ConfigEditor from './ConfigEditor';
import CharacterSelector from './CharacterSelector';
import ShareChat from './ShareChat';
import { useUI } from '@/providers/UIProvider';
import { SignIn, useAuth } from '@clerk/nextjs';

export default function Dialogs() {
    const { userId } = useAuth();
    const { configEditorOpen, shareModalOpen, characterSelectorOpen } = useUI();

    const ActiveDialog = () => {
        if (!userId) {
            return (
                <div className="fixed flex h-full w-full items-center justify-center bg-neutral-900/50 transition-all dark:bg-neutral-700/50">
                    <SignIn path="/" signUpUrl="/sign-up" />
                </div>
            );
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
        <div className="fixed transition-all">
            <ActiveDialog />
        </div>
    );
}
