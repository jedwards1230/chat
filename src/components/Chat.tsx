'use client';

import clsx from 'clsx';
import { useCallback, useState } from 'react';
import { PanInfo, motion } from 'framer-motion';

import { useChat } from '@/providers/ChatProvider';
import { useUI } from '@/providers/UIProvider';
import { isMobile } from '@/utils/client/device';

import Header from './Header';
import ChatInput from './ChatInput';
import ChatThread from './ChatThread';
import ChatHistory from './ChatHistory';
import ChatSettings from './ChatSettings';

export default function Chat() {
    const { currentThread, botTyping, threads } = useChat();
    const activeThread = threads[currentThread];
    const {
        sideBarOpen,
        setSideBarOpen,
        chatSettingsOpen,
        setChatSettingsOpen,
    } = useUI();

    const [swipeInProgress, setSwipeInProgress] = useState(false);

    const onPanStart = (event: MouseEvent | TouchEvent | PointerEvent) => {
        event.stopPropagation();
        setSwipeInProgress(true);
    };

    const onPanEnd = () => setSwipeInProgress(false);

    const onPan = useCallback(
        (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
            const verticalDistance = Math.abs(info.offset.y);

            if (verticalDistance > 30) {
                return;
            }

            if (swipeInProgress) {
                const swipedRightFromLeftEdge =
                    info.point.x < 300 && info.offset.x > 120;

                const swipedLeftFromRightEdge =
                    info.point.x > window.innerWidth - 300 &&
                    info.offset.x < -120;

                const swipedRightFromRightEdge =
                    info.point.x > window.innerWidth - 300 &&
                    info.offset.x > 120;

                const swipedLeftFromLeftEdge =
                    info.point.x < 300 && info.offset.x < -120;

                const onMobileDevice = isMobile('md');

                if (
                    !sideBarOpen &&
                    swipedRightFromLeftEdge &&
                    (!onMobileDevice || !chatSettingsOpen)
                ) {
                    setSideBarOpen(true);
                    setSwipeInProgress(false);
                } else if (sideBarOpen && swipedLeftFromLeftEdge) {
                    setSideBarOpen(false);
                    setSwipeInProgress(false);
                }

                if (
                    !chatSettingsOpen &&
                    swipedLeftFromRightEdge &&
                    (!onMobileDevice || !sideBarOpen)
                ) {
                    setChatSettingsOpen(true);
                    setSwipeInProgress(false);
                } else if (chatSettingsOpen && swipedRightFromRightEdge) {
                    setChatSettingsOpen(false);
                    setSwipeInProgress(false);
                }
            }
        },
        [
            chatSettingsOpen,
            setChatSettingsOpen,
            setSideBarOpen,
            sideBarOpen,
            swipeInProgress,
        ],
    );

    return (
        <div className="flex w-full h-full">
            <ChatHistory activeThread={activeThread} threads={threads} />
            <motion.div
                onPanStart={onPanStart}
                onPanEnd={onPanEnd}
                onPan={onPan}
                className={clsx(
                    'flex h-full w-full flex-col overflow-hidden transition-all',
                    sideBarOpen ? 'sm:pl-72' : 'lg:pl-0',
                    chatSettingsOpen ? 'lg:pr-72' : 'lg:pr-0',
                    botTyping && 'cursor-wait',
                )}
            >
                <Header />
                <ChatThread
                    activeThread={activeThread}
                    style={{
                        pointerEvents: swipeInProgress ? 'none' : 'auto',
                    }}
                />
                <ChatInput />
            </motion.div>
            <ChatSettings />
        </div>
    );
}
