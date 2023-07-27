'use client';

import { Suspense, useEffect, useState } from 'react';
import clsx from 'clsx';
import { PanInfo, motion } from 'framer-motion';

import { useChat } from '@/providers/ChatProvider';
import { useUI } from '@/providers/UIProvider';
import { isMobile } from '@/utils/client';

import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import ChatThread from './ChatThread';
import Header from './Header';
import ChatSettings from './ChatSettings';
import Dialogs from './Dialogs';

export default function Chat() {
    const { activeThread, botTyping } = useChat();
    const {
        sideBarOpen,
        setSideBarOpen,
        chatSettingsOpen,
        setChatSettingsOpen,
    } = useUI();

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

        if (verticalDistance > 30) {
            return;
        }

        if (swipeInProgress) {
            const swipedRightFromLeftEdge =
                info.point.x < 300 && info.offset.x > 120;

            const swipedLeftFromRightEdge =
                info.point.x > window.innerWidth - 300 && info.offset.x < -120;

            const swipedRightFromRightEdge =
                info.point.x > window.innerWidth - 300 && info.offset.x > 120;

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
    }

    useEffect(() => {
        if (typeof window !== undefined) {
            const preventDefaultSwipe = (event: TouchEvent) => {
                event.preventDefault();
            };

            window.addEventListener('touchmove', preventDefaultSwipe, {
                passive: false,
            });

            return () => {
                window.removeEventListener('touchmove', preventDefaultSwipe);
            };
        }
    }, []);

    return (
        <>
            <div className="flex h-full w-full">
                <Suspense fallback={null}>
                    <ChatHistory />
                </Suspense>
                <Suspense fallback={null}>
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
                                pointerEvents: swipeInProgress
                                    ? 'none'
                                    : 'auto',
                            }}
                        />
                        <ChatInput />
                    </motion.div>
                </Suspense>
                <Suspense fallback={null}>
                    <ChatSettings />
                </Suspense>
            </div>
            <Dialogs />
        </>
    );
}
