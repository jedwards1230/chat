'use client';

import { useChat } from '@/providers/ChatProvider';
import { useUI } from '@/providers/UIProvider';
import { Ellipsis } from './Icons';

export default function ChatPlaceholder() {
    return (
        <div className="relative flex flex-col items-center justify-start w-full h-full gap-8 py-2 select-none">
            <Title />
        </div>
    );
}

function Title() {
    const { activeThread } = useChat();
    const { setCharacterSelectorOpen } = useUI();

    return (
        <div className="absolute inset-x-auto inset-y-auto flex flex-col items-center justify-center h-full max-w-4xl gap-2">
            <div className="flex items-center gap-4 md:-mr-8">
                <div className="text-3xl font-medium text-center sm:text-4xl">
                    {activeThread.agentConfig.name}
                </div>
                <div
                    onClick={() => setCharacterSelectorOpen(true)}
                    className="cursor-pointer rounded-full p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                >
                    <Ellipsis />
                </div>
            </div>
        </div>
    );
}
