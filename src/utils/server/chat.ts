import { ChatCompletionFunctions, Configuration, OpenAIApi } from 'openai-edge';

import { Calculator, Search, WebBrowser, WikipediaQueryRun } from '@/tools';
import { prepareMessages } from '..';

const SERVER_KEY = process.env.OPENAI_API_KEY;

export function getOpenAiClient(key?: string) {
    const configuration = new Configuration({
        apiKey: SERVER_KEY || key,
    });
    return new OpenAIApi(configuration);
}

export async function getTitleStream(history: string, key?: string) {
    try {
        const openai = getOpenAiClient(key);
        const completion = await openai.createChatCompletion({
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

        if (!completion.body) {
            throw new Error('No response body from /api/chat');
        }

        return completion.body;
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

    let functions: ChatCompletionFunctions[] | undefined;
    if (tools && tools.length > 0) {
        functions = tools.map((tool) => formatTool(tool));
    }

    try {
        const openai = getOpenAiClient(key);

        const completion = await openai.createChatCompletion(
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

        if (!completion.body) {
            throw new Error('No response body from /api/chat');
        }

        return completion.body;
    } catch (err) {
        console.error(err);
        return new ReadableStream({
            start(controller) {
                controller.error(JSON.stringify(err));
            },
        });
    }
}
