'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';

import { useUI } from '@/providers/UIProvider';
import { useChat } from '@/providers/ChatProvider';
import ChatHistoryEntry from './ChatHistoryEntry';
import { sortThreadlist } from '@/utils';
import { isMobile } from '@/utils/client';
import { Key, Person, Settings } from '../Icons';

export default function ChatHistory() {
    const { userId } = useAuth();
    const [mounted, setMounted] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const { activeThread, threads, openAiApiKey } = useChat();
    const {
        sideBarOpen,
        setSideBarOpen,
        setConfigEditorOpen,
        setOpenAIKeyOpen,
    } = useUI();

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

    const openAIOpen = () => {
        setOpenAIKeyOpen(true);
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
                {/* Header Buttons */}
                <div className="flex w-full justify-between gap-x-2">
                    <Link
                        replace={true}
                        onClick={newThread}
                        className="flex flex-1 justify-center rounded-lg border border-neutral-500 py-2 font-medium transition-colors hover:border-neutral-400 hover:bg-neutral-500 focus:bg-neutral-600 dark:hover:bg-neutral-600 dark:focus:bg-neutral-700"
                        href="/"
                    >
                        New Chat
                    </Link>
                </div>
                {/* Chat History */}
                <div className="flex w-full flex-1 flex-col gap-1 overflow-y-scroll">
                    {threadList.map((thread, i) => (
                        <ChatHistoryEntry
                            key={`${i}-${thread.id}`}
                            entry={thread}
                        />
                    ))}
                </div>
                {/* Footer Buttons */}
                <div className="flex w-full justify-between gap-x-2 pb-6 pl-2 text-sm md:pb-2 md:pl-0">
                    <div className="flex gap-x-2">
                        <button
                            title={
                                userId
                                    ? 'Using Cloud Key (currently set by EnvVar. Ignoring Local Key)'
                                    : openAiApiKey
                                    ? 'Using Local Key'
                                    : 'Invalid OpenAI API Key'
                            }
                            onClick={openAIOpen}
                            className={clsx(
                                'rounded-lg border border-neutral-500 p-2 transition-colors hover:border-neutral-400 hover:bg-neutral-500 focus:bg-neutral-600 dark:hover:bg-neutral-600 dark:focus:bg-neutral-700',
                                userId
                                    ? 'text-green-600'
                                    : openAiApiKey
                                    ? 'text-neutral-300'
                                    : 'text-red-600',
                            )}
                        >
                            {userId ? <Person /> : <Key />}
                        </button>
                    </div>
                    <button
                        name="config-editor-toggle"
                        className="rounded-lg border border-neutral-500 p-2 transition-colors hover:border-neutral-400 hover:bg-neutral-500 focus:bg-neutral-600 dark:hover:bg-neutral-600 dark:focus:bg-neutral-700"
                        onClick={openConfig}
                    >
                        <div className="scale-[85%]">
                            <Settings />
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
