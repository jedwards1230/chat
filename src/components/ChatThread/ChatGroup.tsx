import clsx from 'clsx';

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
                    {messages.map((m, i) => (
                        <ChatBubble
                            key={m.id}
                            message={m}
                            config={config}
                            input={getInput(m, i)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
