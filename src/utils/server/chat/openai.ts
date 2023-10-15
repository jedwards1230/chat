import OpenAI from 'openai';
import { Stream } from 'openai/streaming';
import { type ChatCompletionCreateParams } from 'openai/resources/chat';
import { v4 as uuidv4 } from 'uuid';
import { prepareMessages } from '@/utils';

const SERVER_KEY = process.env.OPENAI_API_KEY;

export function getOpenAiClient(key?: string) {
    return new OpenAI({
        apiKey: SERVER_KEY || key,
        dangerouslyAllowBrowser: !!key,
    });
}

export function toReadableStream(
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

    const openai = getOpenAiClient(key);
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
