import { redis } from '@/lib/redis';
import { notFound } from 'next/navigation';

import { SharedBubble } from '@/components/ChatBubble';
import { Metadata } from 'next';

type Props = {
    params: { slug: string };
};

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
            <div className="grow-1 flex h-full w-full max-w-full flex-col items-center justify-center overflow-y-scroll">
                <div className="mx-auto flex h-full w-full flex-col gap-4 p-2 lg:max-w-4xl">
                    {thread.messages.map((m) => (
                        <SharedBubble
                            key={m.id}
                            message={m}
                            config={shareData.agentConfig}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
