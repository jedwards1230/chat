'use client';

import clsx from 'clsx';

import { useChat, useChatDispatch } from '@/providers/ChatProvider';
import { Chat, Trash } from '../Icons';

export default function ChatHistoryEntry({ entry }: { entry: ChatThread }) {
    const { activeThread } = useChat();
    const dispatch = useChatDispatch();

    // Function to remove a thread and update the local storage
    const removeThread = (e: any) => {
        e.stopPropagation();
        dispatch({ type: 'REMOVE_THREAD', payload: entry.id });
    };

    return (
        <div
            title={`threadId: ${entry.id}`}
            onClick={() =>
                dispatch({
                    type: 'SET_ACTIVE_THREAD',
                    payload: entry,
                })
            }
            className={clsx(
                'grid w-full max-w-full grid-cols-16 items-center justify-between gap-2 rounded-lg px-2 py-1',
                entry.id === activeThread.id
                    ? 'bg-neutral-400/70 dark:bg-neutral-600'
                    : 'cursor-pointer hover:bg-neutral-600',
            )}
        >
            <div className="col-span-2">
                <Chat />
            </div>
            <div className="col-span-12 flex w-full flex-col gap-0 leading-tight">
                <div className="line-clamp-1 text-sm">{entry.title}</div>
                <div className="line-clamp-1 text-xs font-light">
                    {entry.messages.length > 1 ? entry.messages[1].content : ''}
                </div>
            </div>
            <div
                className="col-span-2 flex cursor-pointer select-none items-center justify-center rounded-full text-neutral-300 hover:text-neutral-50"
                onClick={removeThread}
                title="Delete conversation"
            >
                <Trash />
            </div>
        </div>
    );
}
