'use client';

import clsx from 'clsx';
import Link from 'next/link';

import { useChat } from '@/providers/ChatProvider';
import { Chat, Trash } from '../../Icons';
import { isMobile } from '@/utils/client/device';
import { useUI } from '@/providers/UIProvider';
import { deleteThreadById } from '@/utils/server/supabase';
import { deleteLocalThreadById } from '@/utils/client/localstorage';
import { useMessages } from '@/lib/ChatManager';

export default function ChatHistoryEntry({
    entry,
    active,
}: {
    entry: ChatThread;
    active: boolean;
}) {
    const { removeThread, createThread } = useChat();
    const { setSideBarOpen } = useUI();
    const messages = useMessages(entry.currentNode, entry.mapping);

    // Function to remove a thread and update the local storage
    const remove = (e: any) => {
        e.stopPropagation();
        removeThread(entry.id);
        deleteThreadById(entry.id);
        deleteLocalThreadById(entry.id);
        if (active) createThread();
    };

    const setActive = (e: any) => {
        if (isMobile('md')) setSideBarOpen(false);
    };

    if (messages.length <= 1) return null;
    return (
        <div className="relative">
            <Link
                replace={true}
                href={`/?c=${entry.id}`}
                onClick={setActive}
                className={clsx(
                    'flex w-full max-w-full items-center gap-2 rounded-lg px-2 py-1 transition-colors duration-100 hover:bg-neutral-500 peer-hover:bg-neutral-500 dark:hover:bg-neutral-600 dark:peer-hover:bg-neutral-600',
                    active
                        ? 'bg-neutral-500 dark:bg-neutral-600'
                        : 'cursor-pointer focus:bg-neutral-600  dark:focus:bg-neutral-700',
                )}
            >
                <Chat />
                <div className="w-4/5 truncate py-1.5 text-sm leading-tight">
                    {entry.title}
                </div>
            </Link>
            <div
                className="peer absolute right-0 top-0 z-50 col-span-2 mr-2 mt-2 flex cursor-pointer select-none items-center justify-center rounded-full text-neutral-300 hover:text-neutral-50"
                onClick={remove}
                title="Delete conversation"
            >
                <Trash />
            </div>
        </div>
    );
}
