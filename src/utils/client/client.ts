'use client';

import resolveConfig from 'tailwindcss/resolveConfig';
import OpenAI from 'openai';

import tailwindConfig from '../../../tailwind.config.js';

export const fullConfig = resolveConfig(tailwindConfig);

export async function readStream(
    stream: ReadableStream,
    chunkCallback: (
        token: OpenAI.Chat.Completions.ChatCompletionChunk[],
    ) => void,
) {
    const reader = stream.getReader();
    const accumulated = [];

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
            const decoded = new TextDecoder().decode(value);
            try {
                accumulated.push(
                    JSON.parse(
                        decoded,
                    ) as OpenAI.Chat.Completions.ChatCompletionChunk,
                );
                chunkCallback(accumulated);
            } catch (e) {
                continue;
            }
        }
    }
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

export function parseStreamData(
    chunks: (OpenAI.Chat.Completions.ChatCompletionChunk & { error?: any })[],
) {
    let accumulatedResponse = '';
    let toolCalls: ToolInput[] = [];
    let tool = '';
    let toolArgs = '';

    const parseTool = () => {
        try {
            toolCalls.push({
                name: tool as Tool,
                args: JSON.parse(toolArgs),
            });
        } catch {
            toolCalls.push({
                name: tool as Tool,
                args: { input: toolArgs },
            });
        }
        tool = '';
        toolArgs = '';
    };

    for (const c of chunks) {
        if (c.error) {
            accumulatedResponse = c.error;
            throw new Error(c.error);
        }
        const data = c.choices[0];
        if (data) {
            if (data.finish_reason === 'function_call') {
                parseTool();
            }
            if (data.delta.function_call) {
                if (data.delta.function_call.name)
                    tool = data.delta.function_call.name;
                toolArgs += data.delta.function_call.arguments || '';
            }
            if (data.delta.content) {
                accumulatedResponse += data.delta.content;
            }
        }
    }

    return { toolCalls, accumulatedResponse };
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
