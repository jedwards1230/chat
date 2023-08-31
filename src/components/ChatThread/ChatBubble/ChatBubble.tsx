'use client';

import ProfilePicture from './ProfilePicture';
import { ChatBubbleFunctionList } from './ChatBubbleFunctionList';
import { useEffect, useState } from 'react';
import TextContent from './TextContent';
import clsx from 'clsx';

export default function ChatBubble({
    message,
    input,
    config,
}: {
    message: Message;
    input?: string;
    config?: AgentConfig;
}) {
    const [messageInfo, setMessage] = useState<Message>(message);

    useEffect(() => {
        setMessage(message);
    }, [message]);

    return (
        <div
            className={clsx(
                'group relative w-full px-1 pb-6 pt-4 transition-colors sm:px-2',
                message.role !== 'user'
                    ? 'bg-neutral-200/60 dark:bg-neutral-800/70'
                    : 'border-y dark:border-neutral-700',
            )}
        >
            <div className="flex w-full max-w-4xl gap-2 mx-auto md:gap-4">
                <ProfilePicture message={messageInfo} />
                <TextContent
                    message={messageInfo}
                    input={input}
                    config={config}
                />
                <ChatBubbleFunctionList message={messageInfo} />
            </div>
        </div>
    );
}
