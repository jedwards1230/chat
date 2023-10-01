import { fetchChat } from '@/utils/server/chat';

export const runtime = 'edge';

export async function POST(request: Request) {
    const { msgHistory, activeThread, stream, key } =
        (await request.json()) as {
            msgHistory: Message[];
            activeThread: ChatThread;
            stream: boolean;
            key?: string;
        };

    if (!msgHistory) {
        return new Response('No message history', {
            status: 400,
        });
    }

    const res = await fetchChat({ activeThread, msgHistory, stream, key });

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
