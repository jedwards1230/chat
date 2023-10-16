'use server';

import { v4 as uuidv4 } from 'uuid';

import { Calculator, Search, WebBrowser, WikipediaQueryRun } from '@/tools';
import { fetchLlama2Chat } from '@/utils/server/chat/cloudflare';
import { fetchOpenAiChat } from './openai';

const SERVER_KEY = process.env.OPENAI_API_KEY;

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
