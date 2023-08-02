'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import Link from 'next/link';

import { useUI } from '@/providers/UIProvider';
import { useChat } from '@/providers/ChatProvider';
import ChatHistoryEntry from './ChatHistoryEntry';
import { sortThreadlist } from '@/utils';
import { isMobile } from '@/utils/client';
import { Settings } from '../Icons';

export default function ChatHistory() {
    const { activeThread, threads } = useChat();
    const { sideBarOpen, setSideBarOpen, setConfigEditorOpen } = useUI();
    const sidebarRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    const threadList = useMemo(
        () => threads.sort(sortThreadlist),
        // TODO: This is a hack to force a rerender when the active thread changes
        // Do this at a higher level. not here.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [threads, activeThread],
    );

    const openConfig = (e: any) => {
        setConfigEditorOpen(true);
        if (isMobile()) setSideBarOpen(false);
    };

    const newThread = () => {
        if (isMobile()) setSideBarOpen(false);
    };

    useEffect(() => {
        setMounted(true);
        if (sidebarRef.current) {
            const styles = window.getComputedStyle(sidebarRef.current);
            setSideBarOpen(styles.display !== 'none');
        }

        const handleClickOutside = (event: any) => {
            if (
                sideBarOpen &&
                isMobile('md') &&
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target)
            ) {
                event.preventDefault();
                setSideBarOpen(false);
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

    return (
        <div
            ref={sidebarRef}
            className={clsx(
                'fixed z-30 h-full w-72 min-w-[270px] max-w-xs border-r bg-neutral-800 py-2 text-neutral-100 transition-all dark:border-neutral-500 sm:z-auto md:flex lg:inset-y-0',
                !mounted && 'hidden',
                sideBarOpen ? '-translate-x-0' : '-translate-x-full',
            )}
        >
            <div className="relative flex h-full w-full flex-col items-center justify-start gap-4 px-2">
                <div className="flex w-full justify-between gap-x-2">
                    <Link
                        onClick={newThread}
                        className="flex flex-1 justify-center rounded-lg border border-neutral-500 py-2 font-medium transition-colors hover:border-neutral-400 hover:bg-neutral-500 focus:bg-neutral-600 dark:hover:bg-neutral-600 dark:focus:bg-neutral-700"
                        href="/"
                    >
                        New Chat
                    </Link>
                    <button
                        name="config-editor-toggle"
                        className="rounded-lg border border-neutral-500 p-2 font-semibold transition-colors hover:border-neutral-400 hover:bg-neutral-500 focus:bg-neutral-600 dark:hover:bg-neutral-600 dark:focus:bg-neutral-700"
                        onClick={openConfig}
                    >
                        <div className="scale-[85%]">
                            <Settings />
                        </div>
                    </button>
                </div>
                <div className="flex w-full flex-col gap-1 overflow-y-scroll">
                    {threadList.map((thread, i) => (
                        <ChatHistoryEntry
                            key={`${i}-${thread.id}`}
                            entry={thread}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
