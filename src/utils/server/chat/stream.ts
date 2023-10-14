'use server';

import { v4 as uuidv4 } from 'uuid';

import { Calculator, Search, WebBrowser, WikipediaQueryRun } from '@/tools';
import { fetchLlama2Chat } from '@/utils/server/chat/cloudflare';
import { fetchOpenAiChat, getOpenAiClient, toReadableStream } from './openai';

const SERVER_KEY = process.env.OPENAI_API_KEY;

// TODO: generalize this to work with any model
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

type GetChatStreamParams = {
    activeThread: ChatThread;
    msgHistory: Message[];
    signal?: AbortSignal;
    key?: string;
    stream?: boolean;
};

export async function getChatStream({
    activeThread,
    msgHistory = [],
    signal,
    key,
    stream = true,
}: GetChatStreamParams): Promise<ReadableStream<any> | Message> {
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

    let functions: ChatFunction[] | undefined;
    if (tools && tools.length > 0) {
        functions = tools.map((tool) => formatTool(tool));
    }

    console.log({ stream });

    try {
        switch (activeThread.agentConfig.model.name) {
            case 'gpt-3.5-turbo':
            case 'gpt-3.5-turbo-16k':
            case 'gpt-4':
            case 'gpt-4-0613':
                return await fetchOpenAiChat(
                    activeThread,
                    msgHistory,
                    stream,
                    functions,
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
            : {
                  id: uuidv4(),
                  role: 'assistant',
                  content: JSON.stringify(err),
              };
    }
}
