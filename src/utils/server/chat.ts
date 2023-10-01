import OpenAI from 'openai';
import { Stream } from 'openai/streaming';
import { ChatCompletionCreateParams } from 'openai/resources/chat';
import { v4 as uuidv4 } from 'uuid';

import { Calculator, Search, WebBrowser, WikipediaQueryRun } from '@/tools';
import { prepareMessages } from '..';
import { getLlama2Chat } from '@/lib/cloudflare';

const SERVER_KEY = process.env.OPENAI_API_KEY;

export function getOpenAiClient(key?: string) {
    return new OpenAI({
        apiKey: SERVER_KEY || key,
        dangerouslyAllowBrowser: key ? true : false,
    });
}

function toReadableStream(
    stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>,
): ReadableStream {
    let iter: AsyncIterator<OpenAI.Chat.Completions.ChatCompletionChunk>;
    const encoder = new TextEncoder();

    return new ReadableStream({
        async start() {
            iter = stream[Symbol.asyncIterator]();
        },
        async pull(ctrl) {
            try {
                const { value, done } = await iter.next();
                if (done) return ctrl.close();

                const str =
                    typeof value === 'string'
                        ? value
                        : // Add a newline after JSON to make it easier to parse newline-separated JSON on the frontend.
                          JSON.stringify(value) + '\n';
                const bytes = encoder.encode(str);

                ctrl.enqueue(bytes);
            } catch (err) {
                ctrl.error(err);
            }
        },
        async cancel() {
            await iter.return?.();
        },
    });
}

export async function getTitleStream(history: string, key?: string) {
    try {
        const openai = getOpenAiClient(key);
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo-16k',
            messages: [
                {
                    role: 'system',
                    content:
                        'Generate a brief title based on provided chat messages. ' +
                        'Provide only the string for the title. No quotes or labels are necessary.' +
                        'There should only be one subject in the title. ' +
                        'Max length is 20 characters. ',
                },
                {
                    role: 'user',
                    content: history,
                },
            ],
            temperature: 0.1,
            stream: true,
        });

        const stream = toReadableStream(completion);

        if (!stream) {
            throw new Error('No response body from /api/chat');
        }

        return stream;
    } catch (err) {
        console.error(err);
        return new ReadableStream({
            start(controller) {
                controller.error(JSON.stringify(err));
            },
        });
    }
}

type FetchChatParams = {
    activeThread: ChatThread;
    msgHistory: Message[];
    signal?: AbortSignal;
    key?: string;
    stream?: boolean;
};

export async function fetchChat({
    activeThread,
    msgHistory = [],
    signal,
    key,
    stream = true,
}: FetchChatParams): Promise<ReadableStream<any> | Message | string> {
    const tools = activeThread.agentConfig.toolsEnabled
        ? activeThread.agentConfig.tools
        : [];

    const formatTool = (tool: Tool) => {
        const serialize = (obj: CustomTool) => ({
            name: obj.name,
            description: obj.description,
            parameters: obj.parameters,
        });

        switch (tool) {
            case 'calculator':
                return serialize(new Calculator());
            case 'search':
                return serialize(new Search());
            case 'web-browser':
                return serialize(new WebBrowser({ apiKey: SERVER_KEY || key }));
            case 'wikipedia-api':
                return serialize(new WikipediaQueryRun());
        }
    };

    const functions: ChatCompletionCreateParams.Function[] = [];
    if (tools && tools.length > 0) {
        tools.forEach((tool) => functions.push(formatTool(tool)));
    }

    try {
        switch (activeThread.agentConfig.model.name) {
            case 'gpt-3.5-turbo':
            case 'gpt-3.5-turbo-16k':
            case 'gpt-4':
            case 'gpt-4-0613':
                return await fetchOpenAiChat(
                    activeThread,
                    msgHistory,
                    functions,
                    stream,
                    signal,
                    key,
                );
            case 'llama-2-7b-chat-int8':
                return await fetchLlama2Chat(msgHistory);
        }
    } catch (err) {
        console.error(err);
        return stream
            ? new ReadableStream({
                  start(controller) {
                      controller.error(JSON.stringify(err));
                  },
              })
            : JSON.stringify(err);
    }
}

async function fetchLlama2Chat(msgHistory: Message[]) {
    const messages = prepareMessages(msgHistory);
    const res = await getLlama2Chat(messages);
    return res;
}

async function fetchOpenAiChat(
    activeThread: ChatThread,
    msgHistory: Message[],
    functions: ChatCompletionCreateParams.Function[],
    stream: boolean,
    signal?: AbortSignal,
    key?: string,
): Promise<ReadableStream<any> | Message> {
    const messages = prepareMessages(msgHistory);
    const model = activeThread.agentConfig.model;
    const temperature = activeThread.agentConfig.temperature;

    const openai = getOpenAiClient(key);

    const completion = await openai.chat.completions.create(
        {
            model: model.name,
            messages,
            temperature,
            functions,
            stream,
        },
        { signal },
    );

    if (completion instanceof Stream) {
        const stream = toReadableStream(completion);

        if (!stream) {
            throw new Error('No response body from /api/chat');
        }

        return stream;
    }

    return {
        id: uuidv4(),
        content: completion.choices[0].message.content,
        role: completion.choices[0].message.role,
    };
}
