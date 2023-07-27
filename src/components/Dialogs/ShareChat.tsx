'use client';

import Link from 'next/link';

import { useChat } from '@/providers/ChatProvider';
import Dialog from './Dialog';
import { OpenNew } from '../Icons';
import { useUI } from '@/providers/UIProvider';

export default function ShareChat() {
    const { activeThread } = useChat();
    const { setShareModalOpen } = useUI();
    const shareUrl = `${window.location.origin}/share/${activeThread.id}`;

    const handleInputClick = (event: any) => {
        event.target.select();
    };

    return (
        <Dialog callback={() => setShareModalOpen(false)}>
            <div className="w-full text-center text-lg">
                Share URL
                <div className="mt-2 flex items-center justify-between gap-2">
                    <input
                        type="text"
                        readOnly
                        className="w-full rounded-lg border px-2 py-1 focus:outline-none"
                        value={shareUrl}
                        onClick={handleInputClick}
                        onTouchStart={handleInputClick}
                    />
                    <Link
                        href={shareUrl}
                        target="_blank"
                        className="flex items-center justify-center rounded-lg bg-green-600 p-1.5 dark:hover:bg-green-600/80"
                    >
                        <OpenNew />
                    </Link>
                </div>
            </div>
        </Dialog>
    );
}
