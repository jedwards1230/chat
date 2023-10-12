import { getChatStream } from '@/utils/server/chat';

export const runtime = 'edge';

type ReqType = {
    msgHistory: Message[];
    activeThread: ChatThread;
    stream: boolean;
    key?: string;
};

export async function POST(request: Request) {
    const { msgHistory, activeThread, stream, key }: ReqType =
        await request.json();

    if (!msgHistory) {
        return new Response('No message history', {
            status: 400,
        });
    }

    const res = await getChatStream({ activeThread, msgHistory, stream, key });

    if (typeof res === 'string') {
        return new Response(res, {
            status: 500,
        });
    }

    if (res instanceof ReadableStream) {
        return new Response(res, {
            status: 200,
        });
    }

    return new Response(JSON.stringify(res), {
        status: 200,
    });
}
