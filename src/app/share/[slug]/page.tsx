import { notFound } from 'next/navigation';
import { Metadata } from 'next';

import { SharedBubble } from '@/components/ChatThread/ChatBubble';
import { getSharedThreadById } from '@/utils/server/supabase';
import ChatManager from '@/lib/ChatManager';

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const shareData: ChatThread | null | undefined = await getSharedThreadById(
        params.slug,
    );
    if (!shareData) {
        return {
            title: 'Chat not found',
        };
    }

    return {
        title: shareData.title,
        openGraph: {
            url: '/api/og',
            title: shareData.title,
        },
    };
}

export default async function Page({ params }: Props) {
    const thread: ChatThread | null | undefined = await getSharedThreadById(
        params.slug,
    );
    if (!thread) {
        notFound();
    }

    const messages = ChatManager.getOrderedMessages(
        thread.currentNode,
        thread.mapping,
    );

    return (
        <div className="flex h-full w-full flex-col overflow-hidden transition-all">
            <div className="grow-1 flex h-full w-full max-w-full flex-col overflow-y-scroll">
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
                        <SharedBubble
                            key={m.id}
                            message={m}
                            config={thread.agentConfig}
                            input={
                                typeof input === 'string' ? input : input?.input
                            }
                        />
                    );
                })}
            </div>
        </div>
    );
}
