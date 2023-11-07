'use server';

import { v4 as uuidv4 } from 'uuid';

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const LLAMA_2_SECRET = process.env.LLAMA_2_SECRET;
const MODEL: Model = 'llama-2-7b-chat-int8';

export async function getLlama2Chat(
    messages: { role: string; content: string | null }[],
): Promise<Message> {
    const url = new URL(
        `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/@cf/meta/${MODEL}`,
    );

    const headers = {
        Authorization: `Bearer ${LLAMA_2_SECRET}`,
        'Content-Type': 'application/json',
    };

    const res = await fetch(url.toString(), {
        method: 'POST',
        headers,
        body: JSON.stringify({ messages }),
    });

    if (!res.ok) {
        throw new Error(
            `Got ${res.status} error from Llama 2: ${res.statusText}`,
        );
    }

    const json = (await res.json()) as {
        result?: {
            response: string;
        };
        success?: boolean;
        errors?: any[];
        messages?: any[];
    };

    return {
        content: json.result?.response || null,
        role: 'assistant',
        id: uuidv4(),
    };
}

function prepareMessages(messages: Message[]) {
    return messages.map((msg) => {
        return {
            role: msg.role,
            content: msg.content || '',
        };
    });
}

export async function fetchLlama2Chat(msgHistory: Message[]) {
    const messages = prepareMessages(msgHistory);
    if (typeof messages !== 'string' && messages !== null) {
        throw new Error('Messages must be a string or null');
    }
    return getLlama2Chat(messages);
}
