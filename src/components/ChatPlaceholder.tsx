'use client';

import { useChat } from '@/providers/ChatProvider';
import { Ellipsis } from './Icons';
import CharacterSelector from './Dialogs/CharacterSelector';

export default function ChatPlaceholder() {
    const { activeThread } = useChat();

    return (
        <div className="relative flex flex-col items-center justify-start w-full h-full gap-8 py-2 select-none">
            <div className="absolute inset-x-auto inset-y-auto flex flex-col items-center justify-center h-full max-w-4xl gap-2">
                <div className="flex items-center gap-4 md:-mr-8">
                    <div className="text-3xl font-medium text-center sm:text-4xl">
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
