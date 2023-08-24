'use client';

import { useChat } from '@/providers/ChatProvider';
import { useUI } from '@/providers/UIProvider';
import { Ellipsis } from './Icons';

export default function ChatPlaceholder() {
    return (
        <div className="relative flex h-full w-full select-none flex-col items-center justify-start gap-8 py-2">
            <Title />
        </div>
    );
}

function Title() {
    const { activeThread } = useChat();
    const { setCharacterSelectorOpen } = useUI();

    return (
        <div className="absolute inset-x-auto inset-y-auto flex h-full max-w-4xl flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-4 md:-mr-8">
                <div className="text-center text-3xl font-medium dark:text-neutral-300 sm:text-4xl">
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
