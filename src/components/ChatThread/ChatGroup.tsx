import clsx from 'clsx';

import { ChatBubble } from './ChatBubble';
import ProfilePicture from './ChatBubble/ProfilePicture';

export default function ChatGroup({
    groupedMessages,
    config,
}: {
    groupedMessages: MessageGroup;
    config?: AgentConfig;
}) {
    const { messages, role } = groupedMessages;
    return (
        <div
            className={clsx(
                'group relative w-full px-1 pb-6 pt-4 transition-colors sm:px-2',
                role !== 'user'
                    ? 'bg-neutral-200/60 dark:bg-neutral-800/70'
                    : 'border-y dark:border-neutral-700',
            )}
        >
            <div className="mx-auto flex w-full max-w-4xl gap-2 md:gap-4">
                <ProfilePicture role={role} />

                <div>
                    {messages.map((m, i) => {
                        if (m.role === 'assistant' && m.function_call) {
                            return null;
                        }
                        const lastMessage = messages[i - 1];
                        const input =
                            m.role === 'function' &&
                            lastMessage.function_call &&
                            lastMessage.function_call.arguments
                                ? lastMessage.function_call.arguments
                                : undefined;
                        return (
                            <ChatBubble
                                key={m.id}
                                message={m}
                                config={config}
                                input={
                                    typeof input === 'string'
                                        ? input
                                        : input?.input
                                }
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
