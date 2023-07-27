import { notFound } from 'next/navigation';
import { Metadata } from 'next';

import { SharedBubble } from '@/components/ChatThread/ChatBubble';
import { redis } from '@/lib/redis';

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const shareData: ChatThread | null | undefined = await redis.get(
        'share_' + params.slug,
    );
    if (!shareData) {
        return {
            title: 'Chat not found',
        };
    }

    return {
        title: shareData.title,
    };
}

export default async function Page({ params }: Props) {
    const shareData: ChatThread | null | undefined = await redis.get(
        'share_' + params.slug,
    );
    if (!shareData) {
        notFound();
    }

    const thread: ChatThread = {
        ...shareData,
        created: new Date(shareData.created),
        lastModified: new Date(shareData.lastModified),
        messages: JSON.parse(shareData.messages as any),
    };

    return (
        <div className="flex h-full w-full flex-col overflow-hidden transition-all">
            <div className="grow-1 flex h-full w-full max-w-full flex-col overflow-y-scroll">
                {thread.messages.map((m, i) => {
                    if (m.role === 'assistant' && m.function_call) {
                        return null;
                    }
                    const lastMessage = thread.messages[i - 1];
                    return (
                        <SharedBubble
                            key={m.id}
                            message={m}
                            config={shareData.agentConfig}
                            input={
                                m.role === 'function' &&
                                lastMessage.function_call &&
                                lastMessage.function_call.arguments
                                    ? lastMessage.function_call.arguments
                                    : undefined
                            }
                        />
                    );
                })}
            </div>
        </div>
    );
}
