import {
    ChatCompletionFunctions,
    ChatCompletionRequestMessage,
} from 'openai-edge';

import { openai } from '@/lib/openai';
import { Calculator, Search, WebBrowser, WikipediaQueryRun } from '@/tools/';

export const runtime = 'edge';

export async function POST(request: Request) {
    const res = await request.json();
    const {
        messages,
        modelName,
        temperature,
        tools,
    }: {
        messages: ChatCompletionRequestMessage[];
        modelName: Model;
        temperature: number;
        tools: Tool[];
    } = res;

    if (!messages) {
        return new Response('No message history', {
            status: 400,
        });
    }

    const formatTool = (tool: Tool) => {
        const serialize = (obj: CustomTool) => ({
            name: obj.name,
            description: obj.description,
            parameters: obj.parameters,
        });

        switch (tool) {
            case 'calculator':
                return serialize(Calculator);
            case 'search':
                return serialize(Search);
            case 'web-browser':
                return serialize(WebBrowser);
            case 'wikipedia-api':
                return serialize(WikipediaQueryRun);
        }
    };

    let functions: ChatCompletionFunctions[] | undefined;
    if (tools && tools.length > 0) {
        functions = tools.map((tool) => formatTool(tool));
    }

    try {
        const completion = await openai.createChatCompletion({
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
        });
        return new Response(completion.body, {
            headers: {
                'content-type': 'text/event-stream',
            },
        });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify(err), {
            status: 500,
        });
    }
}
