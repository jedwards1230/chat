import OpenAI from 'openai';
import { CompletionCreateParams } from 'openai/resources/chat';
import { Stream } from 'openai/streaming';

import { Calculator, Search, WebBrowser, WikipediaQueryRun } from '@/tools';
import { prepareMessages } from '..';

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
                        'You generate a brief chat title based on provided chat messages. ' +
                        'Provide only the string for the title. No quotes or labels are necessary.' +
                        'There should only be one subject in the title. ' +
                        'Max length is 20 characters. ',
                },
                {
                    role: 'user',
                    content: 'Messages Start:\n' + history + '\nMessages End',
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

export async function getChatStream(
    activeThread: ChatThread,
    msgHistory: Message[],
    signal?: AbortSignal,
    key?: string,
) {
    const messages = prepareMessages(msgHistory);
    const modelName = activeThread.agentConfig.model;
    const temperature = activeThread.agentConfig.temperature;
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

    let functions: CompletionCreateParams.Function[] | undefined;
    if (tools && tools.length > 0) {
        functions = tools.map((tool) => formatTool(tool));
    }

    try {
        const openai = getOpenAiClient(key);

        const completion = await openai.chat.completions.create(
            {
                model: modelName,
                messages,
                temperature,
                stream: true,
                functions,
                //top_p: 1,
                //n: 1,
                //stop,
                //max_tokens: 1024,
                //presence_penalty: 0,
                //frequency_penalty: 0,
                //logit_bias: {},
                //user: "",
            },
            {
                signal,
            },
        );

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
