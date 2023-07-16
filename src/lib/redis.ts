import { Redis } from '@upstash/redis';

const url = process.env.UPSTASH_URL;
const token = process.env.UPSTASH_SECRET;

if (!url || !token) {
    throw new Error('UPSTASH_URL and UPSTASH_SECRET must be provided');
}

export const redis = new Redis({
    url,
    token,
});
