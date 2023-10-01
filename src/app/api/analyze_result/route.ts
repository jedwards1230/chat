import { NextResponse } from 'next/server';
import { CheerioWebBaseLoader } from 'langchain/document_loaders/web/cheerio';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from 'langchain/document';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

import supabase from '@/lib/supabase.server';

export const runtime = 'edge';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: Request) {
    const { query, searchResult, quickSearch } = (await request.json()) as {
        query: string;
        searchResult: SearchResult;
        quickSearch?: boolean;
    };

    try {
        let context: string;
        const embeddings = new OpenAIEmbeddings();
        const vectorStore = new SupabaseVectorStore(embeddings, {
            client: supabase,
            tableName: 'documents',
        });

        const results = await vectorStore.similaritySearch(query, 3, {
            // TODO: ensure results are recent
            url: searchResult.url,
        });

        if (results && results.length > 0) {
            // use stored results
            context = results.map((res) => res.pageContent).join('\n');
        } else if (quickSearch) {
            // use snippet
            context = searchResult.snippet;
            const doc = new Document({
                pageContent: searchResult.snippet,
                metadata: {
                    url: searchResult.url,
                    title: searchResult.title,
                    snippet: searchResult.snippet,
                },
            });
            try {
                await vectorStore.addDocuments([doc]);
            } catch (e) {
                throw new Error('Failed to add document');
            }
        } else {
            // scrape page and grab most relevant text
            const loader = new CheerioWebBaseLoader(searchResult.url);
            const pages = await loader.load();

            const textSplitter = new RecursiveCharacterTextSplitter({
                chunkSize: 2000,
                chunkOverlap: 200,
            });
            const nonAlphanumericRegex = /[^a-zA-Z0-9\s]/g;
            const texts = await textSplitter.splitText(
                pages
                    .map((doc) => {
                        return doc.pageContent.replace(
                            nonAlphanumericRegex,
                            '',
                        );
                    })
                    .join(' '),
            );

            const docs: Document[] = texts.map(
                (pageContent) =>
                    new Document({
                        pageContent,
                        metadata: {
                            url: searchResult.url,
                            title: searchResult.title,
                            snippet: searchResult.snippet,
                        },
                    }),
            );

            await vectorStore.addDocuments(docs);

            const docStore = await MemoryVectorStore.fromDocuments(
                docs,
                embeddings,
            );

            const results = await docStore.similaritySearch(query, 1);
            context = results.map((res) => res.pageContent).join('\n');
        }

        return NextResponse.json({
            context,
        });
    } catch (e) {
        console.log(e);
        return NextResponse.json({
            error: e,
        });
    }
}
