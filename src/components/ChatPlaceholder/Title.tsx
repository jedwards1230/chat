'use client';

import { useChat } from '@/providers/ChatProvider';
import { useUI } from '@/providers/UIProvider';
import { Ellipsis } from '../Icons';

export default function Title() {
    const { activeThread } = useChat();
    const { setCharacterSelectorOpen } = useUI();

    return (
        <div className="absolute inset-x-auto inset-y-auto flex h-full max-w-4xl flex-col items-center justify-center gap-2">
            <div className="-mr-8 flex items-center gap-4">
                <div className="text-center text-4xl font-medium dark:text-neutral-300">
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
