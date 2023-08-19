import { getTitleStream } from '@/utils/server/chat';

export const runtime = 'edge';

export async function POST(request: Request) {
    const {
        history,
    }: {
        history: string;
    } = await request.json();

    if (!history) {
        return new Response('No history', {
            status: 400,
        });
    }

    const stream = await getTitleStream(history);

    return new Response(stream, {
        headers: {
            'content-type': 'text/event-stream',
        },
    });
}
