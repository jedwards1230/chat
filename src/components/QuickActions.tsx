'use client';

import { useChat } from '@/providers/ChatProvider';
import useMessages from '@/lib/ChatManagerHook';
import { Button } from './ui/button';

export default function QuickActions() {
    const { activeThread, botTyping, createThread, abortRequest } = useChat();

    const messages = useMessages(
        activeThread?.currentNode,
        activeThread?.mapping,
    );

    if (!activeThread) return null;
    return (
        <div className="absolute inset-x-0 -top-10 flex justify-end gap-2 px-5 text-sm font-medium text-background dark:text-foreground">
            {botTyping && (
                <Button variant="destructive" size="xs" onClick={abortRequest}>
                    Stop
                </Button>
            )}
            {messages.length > 1 && (
                <Button variant="primaryBlue" size="xs" onClick={createThread}>
                    New Chat
                </Button>
            )}
        </div>
    );
}
