'use client';

import { useChat, useChatDispatch } from '@/providers/ChatProvider';
import { calculateRows } from '@/utils';

export default function Title() {
    const { activeThread } = useChat();
    const dispatch = useChatDispatch();

    const rows = calculateRows(activeThread.agentConfig.systemMessage);

    return (
        <div className="absolute inset-x-auto inset-y-auto flex h-full flex-col items-center justify-center gap-2">
            <div className="text-center text-4xl font-medium">
                {activeThread.agentConfig.name}
            </div>
            <div className="flex gap-1 text-neutral-400">
                System:
                <textarea
                    //rows={rows}
                    value={activeThread.agentConfig.systemMessage}
                    onChange={(e) =>
                        dispatch({
                            type: 'SET_SYSTEM_MESSAGE',
                            payload: e.target.value,
                        })
                    }
                    className="h-auto max-h-48 resize-none overflow-y-visible rounded border border-transparent bg-transparent italic text-neutral-500 focus:border-neutral-500 focus:outline-none"
                />
            </div>
        </div>
    );
}
