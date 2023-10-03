import { notFound } from 'next/navigation';
import { Metadata } from 'next';

import { SharedBubble } from '@/components/ChatThread/ChatBubble';
import { getSharedThreadById } from '@/utils/server/supabase';

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

    return (
        <div className="flex flex-col w-full h-full overflow-hidden transition-all">
            <div className="flex flex-col w-full h-full max-w-full overflow-y-scroll grow-1">
                {thread.messages.map((m, i) => {
                    if (m.role === 'assistant' && m.function_call) {
                        return null;
                    }
                    const lastMessage = thread.messages[i - 1];
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
