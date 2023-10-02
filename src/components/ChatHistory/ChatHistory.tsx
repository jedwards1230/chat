'use client';

import { useEffect, useMemo, useState, memo } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import Image from 'next/image';

import { useUI } from '@/providers/UIProvider';
import ChatHistoryEntry from './ChatHistoryEntry';
import { sortThreadlist } from '@/utils';
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
    activeThread: ChatThread;
    threads: ChatThread[];
}) {
    const { data: session } = useSession();
    const user = session?.user;
    const [mounted, setMounted] = useState(false);
    const { sideBarOpen, setSideBarOpen } = useUI();

    const threadList = useMemo(() => threads.sort(sortThreadlist), [threads]);

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
            <div className="flex w-full flex-1 flex-col gap-1 overflow-y-scroll pt-2 sm:pt-0">
                {threadList.map((thread, i) => (
                    <ChatHistoryEntry
                        key={`${i}-${thread.id}`}
                        entry={thread}
                        activeThread={activeThread}
                    />
                ))}
            </div>
            {/* Footer Buttons */}
            <div className="flex w-full justify-end gap-x-2 pb-3 pl-2 text-sm md:pb-1 md:pl-0">
                <AccountDropdown user={user}>
                    <div className="grid w-full grid-cols-6 items-center gap-1">
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
