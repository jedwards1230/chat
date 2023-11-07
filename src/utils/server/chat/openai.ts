'use server';

import type OpenAI from 'openai';
import { Stream } from 'openai/streaming';

import {
    type ChatCompletionCreateParams,
    type ChatCompletionMessageParam,
} from 'openai/resources/chat';
import { v4 as uuidv4 } from 'uuid';

import { openai } from '@/lib/openai';

export async function fetchOpenAiChat(
    activeThread: ChatThread,
    msgHistory: Message[],
    stream: boolean,
    functions?: ChatCompletionCreateParams.Function[],
    signal?: AbortSignal,
    key?: string,
): Promise<ReadableStream<any> | Message> {
    const messages = prepareMessages(msgHistory);
    const model = activeThread.agentConfig.model;
    const temperature = model.params?.temperature;

    if (key) openai.apiKey = key;
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

    if (!(completion instanceof Stream) && !completion.choices) {
        console.error('No choices in stream data', completion);
    }

    return completion instanceof Stream
        ? toReadableStream(completion)
        : {
              id: uuidv4(),
              content: completion.choices[0].message.content,
              role: completion.choices[0].message.role,
          };
}

// TODO: generalize this to work with any model
export async function getTitleStream(history: string, key?: string) {
    try {
        if (key) openai.apiKey = key;
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo-1106',
            messages: [
                {
                    role: 'system',
                    content:
                        'Generate a brief title based on provided conversation. ' +
                        'Provide only the string for the title. No quotes or labels are necessary.' +
                        'No matter how complex the conversation, make the title extremely brief. ' +
                        'Max length is 20 characters. ',
                },
                {
                    role: 'user',
                    content: `### BEGIN HISTORY ###\n${history}\n### END HISTORY ###\n`,
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

function prepareMessages(messages: Message[]): ChatCompletionMessageParam[] {
    return messages.map((msg) => {
        const functionCall = msg.function_call && {
            ...msg.function_call,
            arguments:
                typeof msg.function_call.arguments === 'string'
                    ? msg.function_call.arguments
                    : msg.function_call?.arguments.input,
        };

        return {
            role: msg.role,
            content: msg.content,
            name: msg.name || 'NAME_NOT_DEFINED',
            ...(functionCall && { function_call: functionCall }),
        };
    });
}
