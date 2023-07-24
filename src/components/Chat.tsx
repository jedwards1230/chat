'use client';

import { useState } from 'react';
import ChatHistory from './ChatHistory';
import { useChat, useChatDispatch } from '@/providers/ChatProvider';
import clsx from 'clsx';
import ChatInput from './ChatInput';
import ChatThread from './ChatThread';
import Header from './Header';
import { PanInfo, motion } from 'framer-motion';
import ChatSettings from './ChatSettings';
import { isMobile } from '@/utils/client';

export default function Chat() {
    const dispatch = useChatDispatch();
    const { sideBarOpen, chatSettingsOpen, activeThread } = useChat();
    const [swipeInProgress, setSwipeInProgress] = useState(false);

    function onPanStart(event: MouseEvent | TouchEvent | PointerEvent) {
        event.stopPropagation();
        setSwipeInProgress(true);
    }

    function onPanEnd() {
        setSwipeInProgress(false);
    }

    function onPan(
        event: MouseEvent | TouchEvent | PointerEvent,
        info: PanInfo,
    ) {
        const verticalDistance = Math.abs(info.offset.y);

        // If the vertical distance is significant, treat this as a text selection, not a swipe.
        if (verticalDistance > 20) {
            return;
        }

        if (swipeInProgress) {
            // Check if user swiped towards right from the left edge of the screen
            const swipedRightFromLeftEdge =
                info.point.x < 300 && info.offset.x > 120;

            // Check if user swiped towards left from the right edge of the screen
            const swipedLeftFromRightEdge =
                info.point.x > window.innerWidth - 300 && info.offset.x < -120;

            // Check if user swiped towards right from the right edge of the screen
            const swipedRightFromRightEdge =
                info.point.x > window.innerWidth - 300 && info.offset.x > 120;

            // Check if user swiped towards left from the left edge of the screen
            const swipedLeftFromLeftEdge =
                info.point.x < 300 && info.offset.x < -120;

            const onMobileDevice = isMobile();

            // Open sideBar if user swiped right from left edge and either user is not on mobile or chatSettings is not open
            if (
                !sideBarOpen &&
                swipedRightFromLeftEdge &&
                (!onMobileDevice || !chatSettingsOpen)
            ) {
                dispatch({ type: 'SET_SIDEBAR_OPEN', payload: true });
                setSwipeInProgress(false);
            }
            // Close sideBar if user swiped left from left edge
            else if (sideBarOpen && swipedLeftFromLeftEdge) {
                dispatch({ type: 'SET_SIDEBAR_OPEN', payload: false });
                setSwipeInProgress(false);
            }

            // Open chatSettings if user swiped left from right edge and either user is not on mobile or sideBar is not open
            if (
                !chatSettingsOpen &&
                swipedLeftFromRightEdge &&
                (!onMobileDevice || !sideBarOpen)
            ) {
                dispatch({ type: 'SET_CHATSETTINGS_OPEN', payload: true });
                setSwipeInProgress(false);
            }
            // Close chatSettings if user swiped right from right edge
            else if (chatSettingsOpen && swipedRightFromRightEdge) {
                dispatch({ type: 'SET_CHATSETTINGS_OPEN', payload: false });
                setSwipeInProgress(false);
            }
        }
    }

    return (
        <div className="flex h-full w-full">
            <ChatHistory />
            <motion.div
                onPanStart={onPanStart}
                onPanEnd={onPanEnd}
                onPan={onPan}
                className={clsx(
                    'flex h-full w-full flex-col overflow-hidden transition-all',
                    sideBarOpen ? 'sm:pl-72' : 'lg:pl-0',
                    chatSettingsOpen ? 'lg:pr-72' : 'lg:pr-0',
                )}
            >
                <Header />
                <ChatThread
                    activeThread={activeThread}
                    style={{ pointerEvents: swipeInProgress ? 'none' : 'auto' }}
                />
                <ChatInput />
            </motion.div>
            <ChatSettings />
        </div>
    );
}
