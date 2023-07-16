'use server';

import { auth } from '@clerk/nextjs';

import { redis } from '../../lib/redis';
import { serializeSaveData } from '..';

export async function getCloudHistory(): Promise<SaveData | null> {
    const { userId } = auth();
    if (!userId) {
        return null;
    }

    const history: any | null | undefined = await redis.get(userId);
    if (!history) {
        return null;
    }

    return {
        ...history,
        chatHistory: history.chatHistory.map((thread: ChatThread) => ({
            ...thread,
            created: new Date(thread.created),
            lastModified: new Date(thread.lastModified),
            messages: JSON.parse(thread.messages as any),
        })),
    };
}

export async function shareChatThread(thread: ChatThread) {
    const { userId } = auth();
    if (!userId) {
        return null;
    }

    const success = await redis.set(
        'share_' + thread.id,
        serializeSaveData({ thread }),
    );
    if (!success) {
        throw new Error('Error saving chat history');
    }

    const expire = await redis.expire('share_' + thread.id, 60 * 60 * 24 * 30);
    if (!expire) {
        throw new Error('Error setting expiration on share');
    }
}

export async function saveCloudHistory(saveData: SaveData) {
    if (saveData.chatHistory.length === 0) return;

    const { userId } = auth();
    if (!userId) {
        throw new Error('No user id');
    }

    const success = await redis.set(userId, serializeSaveData(saveData));
    if (!success) {
        throw new Error('Error saving chat history');
    }
}

export async function searchGoogle(
    input: string,
    googleApiKey?: string,
    googleCSEId?: string,
) {
    const apiKey = process.env.GOOGLE_API_KEY || googleApiKey;
    const CSEId = process.env.GOOGLE_CSE_ID || googleCSEId;

    if (!apiKey || !CSEId) {
        throw new Error(
            'Missing GOOGLE_API_KEY or GOOGLE_CSE_ID environment variables',
        );
    }

    const url = new URL('https://www.googleapis.com/customsearch/v1');
    url.searchParams.set('key', apiKey);
    url.searchParams.set('cx', CSEId);
    url.searchParams.set('q', input);
    url.searchParams.set('start', '1');

    const res = await fetch(url);

    if (!res.ok) {
        throw new Error(
            `Got ${res.status} error from Google custom search: ${res.statusText}`,
        );
    }

    const json = await res.json();

    const results: SearchResult[] =
        json?.items?.map(
            (item: { title?: string; link?: string; snippet?: string }) => ({
                query: input,
                title: item.title,
                url: item.link,
                snippet: item.snippet,
            }),
        ) ?? [];
    return results;
}
