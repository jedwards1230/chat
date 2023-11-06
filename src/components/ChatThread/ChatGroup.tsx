import clsx from 'clsx';
import { useMemo } from 'react';

import { ChatBubble } from '../ChatBubble';
import ProfilePicture from '../ChatBubble/ProfilePicture';

export default function ChatGroup({
    groupedMessages,
    config,
}: {
    groupedMessages: MessageGroup;
    config?: AgentConfig;
}) {
    const { messages, role } = groupedMessages;

    const getInput = (m: Message, i: number) => {
        const lastMessage = messages[i - 1];
        if (m.role === 'function' && lastMessage && lastMessage.function_call) {
            const args = lastMessage.function_call.arguments;
            return typeof args === 'string' ? args : args?.input;
        }
    };

    const subGroups = useMemo(() => {
        const grouped: {
            role: 'file' | 'text';
            messages: Message[];
        }[] = [];

        // helper to add a message to the last group
        const addToLastGroup = (message: Message, r: 'file' | 'text') => {
            if (grouped.length === 0) {
                grouped.push({ role: r, messages: [message] });
            } else {
                grouped[grouped.length - 1].messages.push(message);
            }
        };

        const isFile = (message: Message) =>
            message.role === 'user' && message.name !== undefined;

        // check if the last message is from the same role
        const eqPrevMsg = (role?: 'file' | 'text') =>
            grouped[grouped.length - 1]?.role === role;

        const upsert = (message: Message, r: 'file' | 'text' = 'text') => {
            const role = r;
            if (eqPrevMsg(role)) {
                addToLastGroup(message, r);
            } else {
                grouped.push({ role: r, messages: [message] });
            }
        };

        for (const message of messages) {
            if (isFile(message)) {
                upsert(message, 'file');
            } else {
                upsert(message);
            }
        }

        return grouped;
    }, [messages]);

    return (
        <div
            className={clsx(
                'group relative w-full px-1 pb-6 pt-4 transition-colors sm:px-2',
                role !== 'user'
                    ? 'bg-neutral-200/60 dark:bg-accent'
                    : 'border-y dark:border-neutral-700',
            )}
        >
            <div className="mx-auto flex w-full max-w-4xl gap-2 md:gap-4">
                <ProfilePicture role={role} />
                <div>
                    {subGroups.map(({ role, messages }, i) =>
                        role === 'file' ? (
                            <div
                                key={`${i}-${role}`}
                                className="flex flex-wrap"
                            >
                                {messages.map((m, j) => (
                                    <ChatBubble
                                        key={`${i}-${j}`}
                                        message={m}
                                        config={config}
                                        input={getInput(m, j)}
                                    />
                                ))}
                            </div>
                        ) : (
                            messages.map((m, j) => (
                                <ChatBubble
                                    key={`${i}-${j}`}
                                    message={m}
                                    config={config}
                                    input={getInput(m, j)}
                                />
                            ))
                        ),
                    )}
                </div>
            </div>
        </div>
    );
}
