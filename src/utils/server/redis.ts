'use server';

import { auth } from '@clerk/nextjs';

import redis from '@/lib/redis';
import { serializeSaveData } from '@/utils';

export async function shareThread(thread: ChatThread) {
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
