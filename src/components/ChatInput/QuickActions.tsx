'use client';

import { useChat } from '@/providers/ChatProvider';
import { useMessages } from '@/lib/ChatManager';
import { Button } from '../ui/button';

export default function QuickActions() {
    const {
        activeThread,
        botTyping,
        createThread,
        abortRequest,
        regenerateChat,
        clearChat,
    } = useChat();

    const messages = useMessages(
        activeThread?.currentNode,
        activeThread?.mapping,
    );

    const showStopButton = botTyping && messages.length > 1;
    const showClearButton = !botTyping && messages.length > 1;
    const showRegenerateButton = messages.length > 1;
    const showNewChatButton = messages.length > 1;

    if (!activeThread) return null;
    return (
        <div className="absolute inset-x-0 -top-10 flex justify-end gap-2 px-5 text-sm font-medium text-background dark:text-foreground">
            {showStopButton && (
                <Button variant="destructive" size="xs" onClick={abortRequest}>
                    Stop
                </Button>
            )}
            {showClearButton && (
                <Button variant="destructive" size="xs" onClick={clearChat}>
                    Clear
                </Button>
            )}
            {showRegenerateButton && (
                <Button
                    variant="primaryGreen"
                    size="xs"
                    onClick={() => regenerateChat()}
                >
                    Regenerate
                </Button>
            )}
            {showNewChatButton && (
                <Button variant="primaryBlue" size="xs" onClick={createThread}>
                    New Chat
                </Button>
            )}
        </div>
    );
}
