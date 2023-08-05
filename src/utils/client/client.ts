'use client';

import resolveConfig from 'tailwindcss/resolveConfig';
import OpenAI from 'openai';

import tailwindConfig from '../../../tailwind.config.js';

export const fullConfig = resolveConfig(tailwindConfig);

export async function readStream(
    stream: ReadableStream,
    chunkCallback: (token: string) => void,
) {
    const reader = stream.getReader();
    let accumulatedResponse = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
            const decoded = new TextDecoder().decode(value);
            accumulatedResponse += decoded;
            chunkCallback(accumulatedResponse);
        }
    }

    return accumulatedResponse;
}

export function isMobile(size?: 'sm' | 'md' | 'lg' | 'xl') {
    if (typeof window === 'undefined') return false;
    const screens = fullConfig.theme?.screens as Record<string, string>;
    switch (size) {
        case 'sm':
            return window.innerWidth < parseInt(screens.sm);
        case 'md':
            return window.innerWidth < parseInt(screens.md);
        case 'lg':
            return window.innerWidth < parseInt(screens.lg);
        case 'xl':
            return window.innerWidth < parseInt(screens.xl);
        default:
            return window.innerWidth < parseInt(screens.sm);
    }
}

export async function analyzeSingleResult(
    searchResult: SearchResult,
    query: string,
    quickSearch?: boolean,
) {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
        controller.abort();
        throw new Error('Fetch request timed out');
    }, 15000); // 15 seconds

    try {
        const res = await fetch('/api/analyze_result', {
            method: 'POST',
            body: JSON.stringify({
                searchResult,
                query,
                quickSearch,
            }),
            signal: controller.signal,
        });

        if (!res.ok) {
            throw new Error('Analyze result failed');
        }

        const context: string = await res.json();
        clearTimeout(timeout);
        return context;
    } catch (error) {
        clearTimeout(timeout);
        throw error;
    }
}

export async function callTool(tool: Tool, input: string) {
    const res = await fetch('/api/use_tool', {
        method: 'POST',
        body: JSON.stringify({ tool, input }),
    });

    if (!res.ok) {
        throw new Error(
            `Got ${res.status} error from tool endpoint: ${res.statusText}`,
        );
    }

    return (await res.json()) as string;
}

export function parseStreamData(chunk: string): StreamData[] {
    try {
        return chunk
            .split('\n')
            .filter((c) => c.length > 0)
            .map((c) => {
                // TODO: ensure this only replaces the first instance
                const jsonStr = c.replace('data: ', '');
                if (jsonStr === '[DONE]') return;
                try {
                    return JSON.parse(jsonStr);
                } catch {
                    return;
                }
            });
    } catch (e) {
        console.error(e);
        console.log(chunk);
        return [];
    }
}

export async function validateOpenAIKey(apiKey: string) {
    if (!apiKey) {
        throw new Error('No OpenAI key provided');
    }

    if (apiKey.slice(0, 2) !== 'sk') {
        throw new Error('Invalid OpenAI key');
    }

    const openai = new OpenAI({
        dangerouslyAllowBrowser: true,
        apiKey,
    });
    const modelListData = await openai.models.list();

    if (modelListData && modelListData.data && modelListData.data.length > 0) {
        return true;
    }
    return false;
}
