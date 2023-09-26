'use client';

import Link from 'next/link';

import { useChat } from '@/providers/ChatProvider';
import Dialog from './Dialog';
import { OpenNew } from '../Icons';
import { useUI } from '@/providers/UIProvider';
import { Input } from '../ui/input';

export default function ShareChat() {
    const { activeThread } = useChat();
    const { setShareModalOpen } = useUI();
    const shareUrl = `${window.location.origin}/share/${activeThread.id}`;

    const handleInputClick = (event: any) => {
        event.target.select();
    };

    return (
        <Dialog callback={() => setShareModalOpen(false)}>
            <div className="w-full text-lg text-center">
                Share URL
                <div className="flex items-center justify-between gap-2 mt-2">
                    <Input
                        readOnly={true}
                        className="w-full"
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
