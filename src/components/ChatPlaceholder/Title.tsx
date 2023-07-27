'use client';

import { useChat } from '@/providers/ChatProvider';

export default function Title() {
    const { activeThread, setSystemMessage } = useChat();

    return (
        <div className="absolute inset-x-auto inset-y-auto flex h-full flex-col items-center justify-center gap-2">
            <div className="text-center text-4xl font-medium">
                {activeThread.agentConfig.name}
            </div>
            <div className="flex gap-1 text-neutral-400">
                System:
                <textarea
                    value={activeThread.agentConfig.systemMessage}
                    onChange={(e) => setSystemMessage(e.target.value)}
                    className="h-auto max-h-48 resize-none overflow-y-visible rounded border border-transparent bg-transparent italic text-neutral-500 focus:border-neutral-500 focus:outline-none"
                />
            </div>
        </div>
    );
}
