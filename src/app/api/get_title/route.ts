import { getTitleStream } from '@/utils/server/chat/stream';

export const runtime = 'edge';

type ReqType = {
    history: string;
    apiKey?: string;
};

export async function POST(request: Request) {
    const { history, apiKey }: ReqType = await request.json();

    if (!history) {
        return new Response('No history', {
            status: 400,
        });
    }

    const stream = await getTitleStream(history, apiKey);

    return new Response(stream, {
        headers: {
            'content-type': 'text/event-stream',
        },
    });
}
