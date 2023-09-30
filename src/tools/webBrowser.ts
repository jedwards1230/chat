import * as cheerio from 'cheerio';
import { BaseLanguageModel } from 'langchain/dist/base_language';
import {
    TextSplitter,
    RecursiveCharacterTextSplitter,
} from 'langchain/text_splitter';
import { Document } from 'langchain/document';
import { ToolParams } from 'langchain/tools';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';

type Headers = Record<string, any>;

const DEFAULT_HEADERS: Headers = {
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'en-US,en;q=0.5',
    Connection: 'keep-alive',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'cross-site',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent':
        'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/111.0',
};

export interface WebBrowserArgs extends ToolParams {
    headers?: Headers;
    textSplitter?: TextSplitter;
    apiKey?: string;
}

export class WebBrowser implements CustomTool {
    private model: BaseLanguageModel;

    private embeddings: OpenAIEmbeddings;

    private headers: Headers;

    private textSplitter: TextSplitter;

    constructor({ headers, textSplitter, apiKey }: WebBrowserArgs) {
        const model = new ChatOpenAI({
            temperature: 0.3,
            modelName: 'gpt-3.5-turbo-16k',
            openAIApiKey: process.env.OPENAI_API_KEY || apiKey,
        });
        const embeddings = new OpenAIEmbeddings();

        this.model = model;
        this.embeddings = embeddings;
        this.headers = headers ?? DEFAULT_HEADERS;
        this.textSplitter =
            textSplitter ??
            new RecursiveCharacterTextSplitter({
                chunkSize: 2000,
                chunkOverlap: 200,
            });
    }

    async call(input: string) {
        // get first substring from input
        let url = '';
        try {
            url = JSON.parse(input.split(' ')[0]);
        } catch {
            url = input.split(' ')[0];
        }
        const task = input.slice(url.length + 1);
        const doSummary = !task;

        let text;
        try {
            const html = await getHtml(url, this.headers);
            text = getText(html, url, doSummary);
        } catch (e) {
            if (e) {
                return e.toString();
            }
            return 'There was a problem connecting to the site';
        }

        const texts = await this.textSplitter.splitText(text);

        let context;
        // if we want a summary grab first 4
        if (doSummary) {
            context = texts.slice(0, 4).join('\n');
        }
        // search term well embed and grab top 4
        else {
            const docs = texts.map(
                (pageContent) =>
                    new Document({
                        pageContent,
                        metadata: [],
                    }),
            );

            const vectorStore = await MemoryVectorStore.fromDocuments(
                docs,
                this.embeddings,
            );
            const results = await vectorStore.similaritySearch(task, 4);
            context = results.map((res) => res.pageContent).join('\n');
        }

        const instruction = `Text:${context}\n\nI need ${
            doSummary ? 'a summary' : task
        } from the above text, also provide up to 5 markdown links from within that would be of interest (always including URL and text). Links should be provided, if present, in markdown syntax as a list under the heading "Relevant Links:".`;

        return this.model.predict(instruction);
    }

    name: Tool = 'web-browser';
    description = `useful for when you need to find something on or summarize a webpage. input should be a valid http URL including protocol. Task is optional and represents what you want to find on the page. If task is not provided, a brief summary of the webpage will be returned. If a task is given, specific data from the webpage will be returned.`;
    parameters = {
        type: 'object',
        properties: {
            url: {
                type: 'string',
                description: 'A valid http URL including protocol.',
            },
            task: {
                type: 'string',
                description:
                    'Optional. What you want to find on the page. If not provided, a summary of the page will be returned.',
            },
        },
        required: ['url'],
    };
}

function getText(html: string, baseUrl: string, summary: boolean): string {
    // scriptingEnabled so noscript elements are parsed
    const $ = cheerio.load(html, { scriptingEnabled: true });

    let text = '';

    // lets only get the body if its a summary, dont need to summarize header or footer etc
    const rootElement = summary ? 'body ' : '*';

    $(`${rootElement}:not(style):not(script):not(svg)`).each(
        (_i, elem: any) => {
            // we dont want duplicated content as we drill down so remove children
            let content = $(elem)
                .clone()
                .children()
                .remove()
                .end()
                .text()
                .trim();
            const $el = $(elem);

            // if its an ahref, print the content and url
            let href = $el.attr('href');
            if ($el.prop('tagName')?.toLowerCase() === 'a' && href) {
                if (!href.startsWith('http')) {
                    try {
                        href = new URL(href, baseUrl).toString();
                    } catch {
                        // if this fails thats fine, just no url for this
                        href = '';
                    }
                }

                const imgAlt = $el.find('img[alt]').attr('alt')?.trim();
                if (imgAlt) {
                    content += ` ${imgAlt}`;
                }

                text += ` [${content}](${href})`;
            }
            // otherwise just print the content
            else if (content !== '') {
                text += ` ${content}`;
            }
        },
    );

    return text.trim().replace(/\n+/g, ' ');
}

async function getHtml(baseUrl: string, headers: Headers) {
    let url;
    try {
        url = new URL(baseUrl);
    } catch (e) {
        console.error(baseUrl, e);
        throw new Error('Invalid URL');
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.text();
}
