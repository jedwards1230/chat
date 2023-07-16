'use client';

import { useChat, useChatDispatch } from '@/providers/ChatProvider';
import { Bars, Share } from './Icons';
import clsx from 'clsx';
import { isMobile } from '@/utils/client';
import { shareChatThread } from '@/utils/server';
import { motion } from 'framer-motion';

export default function Header() {
    const { activeThread, sideBarOpen } = useChat();
    const dispatch = useChatDispatch();

    const handleSidebarToggle = () => {
        dispatch({ type: 'SET_SIDEBAR_OPEN' });
    };

    const handleShare = async () => {
        try {
            await shareChatThread(activeThread);
            dispatch({
                type: 'SET_SHARE_MODAL_OPEN',
                payload: true,
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div
            className={clsx(
                'grid w-full grid-cols-12 border-b px-2 py-2',
                activeThread.messages.length > 1
                    ? 'border-neutral-300 shadow dark:border-neutral-500'
                    : 'border-transparent bg-transparent',
            )}
        >
            <div className="col-span-1 flex items-center justify-start">
                <motion.button
                    layoutId="sidebar-toggle"
                    className={clsx(
                        'cursor-pointer px-1 text-neutral-400 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-50',
                        sideBarOpen && isMobile() && 'hidden sm:flex',
                    )}
                    onClick={handleSidebarToggle}
                >
                    <Bars />
                </motion.button>
            </div>
            <div
                className={clsx(
                    'col-span-10 text-center',
                    sideBarOpen && isMobile() && 'col-start-2 sm:col-start-1',
                )}
            >
                {activeThread.messages.length > 1 && (
                    <>
                        <p className="line-clamp-1 font-semibold">
                            {activeThread.title}
                        </p>
                        <p className="text-sm font-light text-neutral-500">
                            {activeThread.agentConfig.model} |{' '}
                            {activeThread.messages.length} messages
                        </p>
                    </>
                )}
            </div>
            {activeThread.messages.length > 1 && (
                <div className="col-span-1 flex items-center justify-end">
                    <button
                        className="cursor-pointer px-1 text-neutral-400 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-50"
                        onClick={handleShare}
                    >
                        <Share />
                    </button>
                </div>
            )}
        </div>
    );
}
