'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import Link from 'next/link';

import { useUI } from '@/providers/UIProvider';
import { useChat } from '@/providers/ChatProvider';
import ChatHistoryEntry from './ChatHistoryEntry';
import { sortThreadlist } from '@/utils';
import { isMobile } from '@/utils/client';
import Sidebar from '../Sidebar';
import { ApiButton, SettingsButton, ThemeToggle } from './Buttons';
import { Button } from '../ui/button';

export default function ChatHistory() {
    const [mounted, setMounted] = useState(false);
    const { activeThread, threads } = useChat();
    const { sideBarOpen, setSideBarOpen } = useUI();

    const threadList = useMemo(
        () => threads.sort(sortThreadlist),
        // TODO: This is a hack to force a rerender when the active thread changes
        // Do this at a higher level. not here.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [threads, activeThread],
    );

    const newThread = () => {
        if (isMobile()) setSideBarOpen(false);
    };

    useEffect(() => {
        if (isMobile()) setSideBarOpen(false);
        setMounted(true);
    }, [setSideBarOpen]);

    return (
        <Sidebar
            pos="left"
            close={() => setSideBarOpen(false)}
            className={clsx('px-2', !mounted && 'hidden')}
            open={sideBarOpen}
        >
            {/* Header Buttons */}
            <Link
                className="flex w-full"
                replace={true}
                onClick={newThread}
                href="/"
            >
                <Button className="w-full" variant="outline">
                    New Chat
                </Button>
            </Link>
            {/* Chat History */}
            <div className="flex w-full flex-1 flex-col gap-1 overflow-y-scroll pt-4">
                {threadList.map((thread, i) => (
                    <ChatHistoryEntry
                        key={`${i}-${thread.id}`}
                        entry={thread}
                    />
                ))}
            </div>
            {/* Footer Buttons */}
            <div className="flex w-full justify-end gap-x-2 pb-3 pl-2 text-sm md:pb-1 md:pl-0">
                <ApiButton />
                <ThemeToggle />
                <SettingsButton />
            </div>
        </Sidebar>
    );
}
