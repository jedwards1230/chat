'use client';

import { useChat } from '@/providers/ChatProvider';
import { Ellipsis } from './Icons';
import CharacterSelector from './Dialogs/CharacterSelector';

export default function ChatPlaceholder() {
    const { activeThread } = useChat();

    return (
        <div className="relative flex h-full w-full select-none flex-col items-center justify-start gap-8 py-2 duration-300 animate-in fade-in-0 slide-in-from-bottom-8">
            <div className="absolute inset-x-auto inset-y-auto flex h-full max-w-4xl flex-col items-center justify-center gap-2">
                <div className="flex items-center gap-4 md:-mr-8">
                    <div className="text-center text-3xl font-medium sm:text-4xl">
                        {activeThread.agentConfig.name}
                    </div>
                    <CharacterSelector>
                        <Ellipsis />
                    </CharacterSelector>
                </div>
            </div>
        </div>
    );
}
