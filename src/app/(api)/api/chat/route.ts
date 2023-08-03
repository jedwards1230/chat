import { getChatStream } from '@/utils/server/chat';

export const runtime = 'edge';

export async function POST(request: Request) {
    const res = await request.json();
    const {
        msgHistory,
        activeThread,
    }: {
        msgHistory: Message[];
        activeThread: ChatThread;
    } = res;

    if (!msgHistory) {
        return new Response('No message history', {
            status: 400,
        });
    }

    const stream = await getChatStream(activeThread, msgHistory);

    return new Response(stream, {
        status: 200,
    });
}
