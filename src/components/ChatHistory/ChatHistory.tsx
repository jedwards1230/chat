'use client';

import { useEffect, useMemo, useRef } from 'react';

import { useChat, useChatDispatch } from '@/providers/ChatProvider';
import ChatHistoryEntry from './ChatHistoryEntry';
import { Settings } from '../Icons';
import { isMobile } from '@/utils/client';
import clsx from 'clsx';

export default function ChatHistory() {
    const { threadList, sideBarOpen } = useChat();
    const dispatch = useChatDispatch();
    const sidebarRef = useRef<HTMLDivElement>(null);

    const closeSidebar = () => {
        dispatch({ type: 'SET_SIDEBAR_OPEN', payload: false });
    };

    const openConfig = (e: any) => {
        dispatch({ type: 'SET_CONFIG_EDITOR_OPEN', payload: true });
        if (isMobile()) dispatch({ type: 'SET_SIDEBAR_OPEN', payload: false });
    };

    const newThread = () => {
        dispatch({ type: 'CREATE_THREAD' });
        if (isMobile()) closeSidebar();
    };

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (
                sideBarOpen &&
                isMobile('md') &&
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target)
            ) {
                event.preventDefault();
                closeSidebar();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const sortedThreadList = useMemo(
        () =>
            threadList.sort(
                (a, b) => b.lastModified.getTime() - a.lastModified.getTime(),
            ),
        [threadList],
    );

    return (
        <div
            ref={sidebarRef}
            className={clsx(
                'fixed z-30 h-full w-72 min-w-[270px] max-w-xs border-r bg-neutral-800 py-2 text-neutral-100 transition-all dark:border-neutral-500 sm:z-auto lg:inset-y-0 lg:flex',
                sideBarOpen ? '-translate-x-0' : '-translate-x-full',
            )}
        >
            <div className="relative flex h-full w-full flex-col items-center justify-start gap-4 px-2">
                <div className="flex w-full justify-between gap-x-2">
                    <button
                        className="flex-1 rounded-lg border border-neutral-500 py-2 font-medium transition-colors hover:border-neutral-400 hover:bg-neutral-600 dark:hover:bg-neutral-700"
                        onClick={newThread}
                    >
                        New Chat
                    </button>
                    <button
                        className="rounded-lg border border-neutral-500 p-2 font-semibold transition-colors hover:border-neutral-400 hover:bg-neutral-600 dark:hover:bg-neutral-700"
                        onClick={openConfig}
                    >
                        <div className="scale-[85%]">
                            <Settings />
                        </div>
                    </button>
                </div>
                <div className="flex w-full flex-col gap-1 overflow-y-scroll">
                    {sortedThreadList &&
                        sortedThreadList.map((m, i) => (
                            <ChatHistoryEntry
                                key={`${i}-${m.messages.length}`}
                                entry={m}
                            />
                        ))}
                </div>
            </div>
        </div>
    );
}
