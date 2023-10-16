import { Calculator, Search, WebBrowser, WikipediaQueryRun } from '@/tools/';
import { parseInput } from '@/tools/utils';
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

    let parsed = '';
    try {
        parsed = JSON.parse(input);
    } catch {
        parsed = input;
    }

    const parsedInput = parseInput(parsed, tool);

    try {
        let result = '';
        switch (tool) {
            case 'calculator':
                result = new Calculator().call(parsedInput);
                break;
            case 'search':
                result = await new Search().call(parsedInput);
                break;
            case 'web-browser':
                result = await new WebBrowser({}).call(parsedInput);
                break;
            case 'wikipedia-api':
                result = await new WikipediaQueryRun().call(parsedInput);
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
