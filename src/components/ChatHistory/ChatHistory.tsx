'use client';

import { useEffect, useState, memo } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import Image from 'next/image';

import { useUI } from '@/providers/UIProvider';
import ChatHistoryEntry from './ChatHistoryEntry';
import { isMobile } from '@/utils/client/device';
import { Sidebar } from '../Sidebar';
import { AccountDropdown } from './Buttons';
import { Button } from '../ui/button';
import { useSession } from 'next-auth/react';
import { Ellipsis } from '../Icons';

function ChatHistory({
    activeThread,
    threads,
}: {
    activeThread?: ChatThread;
    threads: ChatThread[];
}) {
    const { data: session } = useSession();
    const user = session?.user;
    const [mounted, setMounted] = useState(false);
    const { sideBarOpen, setSideBarOpen } = useUI();

    const threadList = threads;

    const newThread = () => {
        if (isMobile()) setSideBarOpen(false);
    };

    useEffect(() => {
        if (isMobile()) setSideBarOpen(false);
        setMounted(true);
    }, [setSideBarOpen]);

    const getMessageCount = (mapping: MessageMapping) => {
        let count = 0;
        for (const key in mapping) {
            const r = mapping[key];
            if (r) count++;
        }
        return count;
    };

    const messageCount = getMessageCount(activeThread?.mapping || {});

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
            <div className="flex flex-col flex-1 w-full gap-1 pt-2 overflow-y-scroll sm:pt-0">
                {threadList.map((thread, i) =>
                    messageCount > 1 ? (
                        <ChatHistoryEntry
                            key={`${i}-${thread.id}`}
                            entry={thread}
                            active={thread.id === activeThread?.id}
                        />
                    ) : null,
                )}
            </div>
            {/* Footer Buttons */}
            <div className="flex justify-end w-full pb-3 pl-2 text-sm gap-x-2 md:pb-1 md:pl-0">
                <AccountDropdown user={user}>
                    <div className="grid items-center w-full grid-cols-6 gap-1">
                        {user ? (
                            <>
                                {user.image && (
                                    <Image
                                        src={user.image}
                                        alt="Profile Picture"
                                        width={32}
                                        height={32}
                                        className="col-span-1"
                                    />
                                )}
                                <div className="col-span-4 truncate text-ellipsis">
                                    {user.email}
                                </div>
                            </>
                        ) : (
                            <div className="col-span-5 text-left">Menu</div>
                        )}
                        <div className="flex justify-center col-span-1">
                            <Ellipsis />
                        </div>
                    </div>
                </AccountDropdown>
            </div>
        </Sidebar>
    );
}

export default memo(ChatHistory);
