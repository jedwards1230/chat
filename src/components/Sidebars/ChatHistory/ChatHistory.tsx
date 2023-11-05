'use client';

import { useEffect, useState, memo } from 'react';
import clsx from 'clsx';
import Image from 'next/image';

import { useUI } from '@/providers/UIProvider';
import ChatHistoryEntry from './ChatHistoryEntry';
import { isMobile } from '@/utils/client/device';
import { Sidebar } from '../../Sidebar';
import { AccountDropdown } from './Buttons';
import { Button } from '../../ui/button';
import { useSession } from 'next-auth/react';
import { Ellipsis } from '../../Icons';
import { useChat } from '@/providers/ChatProvider';

function ChatHistory({
    activeThread,
    threads,
}: {
    activeThread?: ChatThread;
    threads: ChatThread[];
}) {
    const { createThread } = useChat();
    const { data: session } = useSession();
    const user = session?.user;
    const [mounted, setMounted] = useState(false);
    const { sideBarOpen, setSideBarOpen } = useUI();

    //const threadList = threads.sort(sortThreadlist);
    const organizedThreads = organizeThreadsByDate(threads);

    const newThread = () => {
        if (isMobile()) setSideBarOpen(false);
        createThread();
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
            <Button
                className="w-full"
                onClick={newThread}
                variant="outlineAccent"
            >
                New Chat
            </Button>
            {/* Chat History */}
            <div className="flex w-full flex-1 flex-col gap-1 overflow-y-scroll pt-2 sm:pt-0">
                {organizedThreads.map(({ thread, header }, i) => (
                    <>
                        {/* {header && (
                            <div
                                key={`${i}-${header}`}
                                className="w-full px-2 text-sm text-gray-400 "
                            >
                                {header}
                            </div>
                        )} */}
                        <ChatHistoryEntry
                            key={`${i}-${thread.id}`}
                            entry={thread}
                            active={thread.id === activeThread?.id}
                        />
                    </>
                ))}
            </div>
            {/* Footer Buttons */}
            <div className="flex w-full justify-end gap-x-2 pb-3 pl-2 text-sm md:pb-1 md:pl-0">
                <AccountDropdown user={user}>
                    <div className="grid w-full grid-cols-7 items-center gap-1">
                        {user ? (
                            <>
                                {user.image && (
                                    <Image
                                        src={user.image}
                                        alt="Profile Picture"
                                        width={32}
                                        height={32}
                                        className="col-span-1 rounded-sm"
                                    />
                                )}
                                <div className="col-span-5 truncate text-ellipsis">
                                    {user.email}
                                </div>
                            </>
                        ) : (
                            <div className="col-span-6 text-left">Menu</div>
                        )}
                        <div className="col-span-1 flex justify-center">
                            <Ellipsis />
                        </div>
                    </div>
                </AccountDropdown>
            </div>
        </Sidebar>
    );
}

export default memo(ChatHistory);

type SortedChatThread = { thread: ChatThread; header?: string };

function organizeThreadsByDate(threadList: ChatThread[]): SortedChatThread[] {
    const currentDate = new Date();
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds

    return threadList
        .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime()) // sorting threads by lastModified
        .reduce((acc: SortedChatThread[], thread, i, arr) => {
            const diffDays = Math.round(
                (currentDate.getTime() - thread.lastModified.getTime()) /
                    oneDay,
            );

            let header: string | undefined;

            if (
                i === 0 ||
                (diffDays <= 7 &&
                    (i === 0 ||
                        Math.round(
                            (currentDate.getTime() -
                                arr[i - 1].lastModified.getTime()) /
                                oneDay,
                        ) > 7))
            ) {
                header = 'Last 7 days';
            } else if (
                diffDays <= 30 &&
                (i === 0 ||
                    Math.round(
                        (currentDate.getTime() -
                            arr[i - 1].lastModified.getTime()) /
                            oneDay,
                    ) > 30)
            ) {
                header = 'Last 30 days';
            } else if (
                diffDays <= 365 &&
                (i === 0 ||
                    Math.round(
                        (currentDate.getTime() -
                            arr[i - 1].lastModified.getTime()) /
                            oneDay,
                    ) > 365)
            ) {
                header = `${
                    thread.lastModified.getMonth() + 1
                }/${thread.lastModified.getFullYear()}`;
            } else if (
                diffDays > 365 &&
                (i === 0 ||
                    arr[i - 1].lastModified.getFullYear() <
                        thread.lastModified.getFullYear())
            ) {
                header = `${thread.lastModified.getFullYear()}`;
            }

            acc.push({ thread, header });

            return acc;
        }, []);
}
