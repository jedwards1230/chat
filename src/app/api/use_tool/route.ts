import { Calculator, Search, WebBrowser, WikipediaQueryRun } from '@/tools/';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
    const { tool, input } = (await request.json()) as {
        tool: Tool;
        input: string;
    };

    if (!tool) {
        return new Response('No tool', {
            status: 400,
        });
    }

    if (!input) {
        return new Response('No input', {
            status: 400,
        });
    }

    const cleanInput = input.slice(1, input.length - 1);

    try {
        let result = '';
        switch (tool) {
            case 'calculator':
                result = new Calculator().call(cleanInput);
                break;
            case 'search':
                result = await new Search().call(cleanInput);
                break;
            case 'web-browser':
                result = await new WebBrowser({}).call(cleanInput);
                break;
            case 'wikipedia-api':
                result = await new WikipediaQueryRun().call(cleanInput);
                break;
            default:
                return new Response(`Invalid tool: ${tool}`, {
                    status: 400,
                });
        }

        return NextResponse.json(result);
    } catch (e) {
        console.log(e);
        return new Response(JSON.stringify(e), {
            status: 500,
        });
    }
}
