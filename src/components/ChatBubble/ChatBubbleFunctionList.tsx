'use client';

import { Clipboard, PencilSquare, Reset, Trash } from '@/components/Icons';
import { useChat } from '@/providers/ChatProvider';
import ChatBubbleFunction from './ChatBubbleFunction';

export function ChatBubbleFunctionList({ message }: { message: Message }) {
    const { editMessage, removeMessage, regenerateChat } = useChat();
    const isSystem = message.role === 'system';
    const isUser = message.role === 'user';

    return (
        <div className="absolute bottom-0 right-2 hidden gap-2 group-hover:flex sm:right-4 md:right-8 lg:right-16">
            {isUser && !isSystem && (
                <ChatBubbleFunction
                    icon={<Reset />}
                    color="green"
                    title={'Regenerate Message'}
                    onClick={() => regenerateChat(message.id)}
                />
            )}
            {!isSystem && (
                <ChatBubbleFunction
                    icon={<PencilSquare />}
                    color="blue"
                    title={'Edit Message'}
                    onClick={() => editMessage(message.id)}
                />
            )}
            {!isSystem && (
                <ChatBubbleFunction
                    icon={<Trash />}
                    color="red"
                    title={'Delete Message'}
                    onClick={() => removeMessage(message.id)}
                />
            )}
            {!isSystem && (
                <ChatBubbleFunction
                    title={'Copy'}
                    onClick={() => {
                        // Requires https on iOS Safari. Will not work on localhost.
                        message.content &&
                            navigator.clipboard.writeText(message.content);
                    }}
                    icon={<Clipboard />}
                />
            )}
        </div>
    );
}
