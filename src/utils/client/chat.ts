'use client';

import { Dispatch, SetStateAction } from 'react';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';

import { readStream, callTool, parseStreamData } from '../client';
import { getChatStream, getTitleStream } from '../server/chat';

const MAX_LOOPS = 10;

export function createUserMsg(
    content: string,
    editId?: string | null,
): Message {
    return {
        id: editId ? editId : uuidv4(),
        role: 'user',
        content,
    };
}

export function createFunctionCallMsg(
    input: ToolInput,
    editId?: string | null,
): Message {
    return {
        id: editId ? editId : uuidv4(),
        content: JSON.stringify(input.args),
        role: 'assistant',
        name: input.name,
        function_call: {
            name: input.name,
            arguments: input.args,
        },
    };
}

/**
 * This function fetches the title for a given input text.
 * It sends a POST request to the '/api/get_title' endpoint with the chat history and input as the body.
 * It then processes the response stream and calls the provided callback function with the title as the argument.
 *
 * @param {ChatThread} activeThread - The active thread of the chatbot.
 * @param {string} input - The input text to fetch the title for.
 * @param {(title: string) => void} callback - The callback function to be called with the fetched title.
 * @param {string} userId - The user ID to be used for the request.
 * @param {string} openAiApiKey - The OpenAI API key to be used for the request.
 */
export async function getTitle(
    activeThread: ChatThread,
    input: string,
    callback: (title: string) => void,
    userId?: string | null,
    openAiApiKey?: string,
) {
    const l = activeThread.messages.length;
    if (l < 2 || l > 10) return;

    const stream = await requestTitleStream(
        activeThread.messages,
        input,
        userId,
        openAiApiKey,
    );

    // Callback function to handle each chunk of the response stream
    const streamCallback = (
        chunk: OpenAI.Chat.Completions.ChatCompletionChunk[],
    ) => {
        const parsed = parseStreamData(chunk);
        callback(parsed.accumulatedResponse);
    };

    // Read the response stream
    await readStream(stream!, streamCallback);
}

type GetChatParams = {
    /** The history of messages in the conversation. */
    msgHistory: Message[];
    /** Used to optionally abort DOM requests. */
    controller: AbortController;
    /** The active thread of the chatbot. */
    activeThread: ChatThread;
    /** The number of recursive calls made to this function. Default is 0. */
    loops?: number;
    /** The state setter function from the useState React Hook. */
    setState: Dispatch<SetStateAction<ChatState>>;
    /** Function to add a new message or update an existing one. */
    upsertMessage: (message: Message) => void;
    /** The user ID to use for the request. */
    userId?: string | null;
    /** The API key to use for the request. */
    apiKey?: string;
    retries?: number;
};

/**
 * This function interacts with the AI model to generate responses for the chatbot.
 * It checks if the AI model requests a tool, and if so, recursively replies with tool messages.
 * The recursion is broken when the AI response doesn't request a tool.
 */
export async function getChat({
    msgHistory,
    controller,
    activeThread,
    loops = 0,
    setState,
    upsertMessage,
    userId,
    apiKey,
    retries = 0,
}: GetChatParams) {
    try {
        if (loops > MAX_LOOPS) {
            throw new Error('Too many loops');
        }

        const assistantId = uuidv4();
        let tools: ToolInput[] = [];
        let toolInput: string = '';
        let accumulatedResponse = '';

        // Callback function to handle each chunk of the response stream
        const streamCallback = (
            chunk: OpenAI.Chat.Completions.ChatCompletionChunk[],
        ) => {
            toolInput = '';

            const parsed = parseStreamData(chunk);
            accumulatedResponse = parsed.accumulatedResponse || '';
            tools = parsed.toolCalls || [];

            if (tools.length === 0 && accumulatedResponse !== '') {
                upsertMessage({
                    id: assistantId,
                    content: accumulatedResponse,
                    role: 'assistant',
                });
            }
        };

        setState((prevState) => ({
            ...prevState,
            botTyping: true,
        }));

        const stream = await requestChatStream(
            activeThread,
            controller.signal,
            msgHistory,
            userId,
            apiKey,
        );

        // Read the response stream
        try {
            await readStream(stream, streamCallback);
        } catch (e) {
            if (retries < 5) {
                setTimeout(() => {
                    getChat({
                        msgHistory,
                        controller,
                        activeThread,
                        loops,
                        setState,
                        upsertMessage,
                        userId,
                        apiKey,
                        retries: retries + 1,
                    });
                }, 100);
            }
        }

        // Set chat state
        setState((prevState) => ({
            ...prevState,
            saved: false,
            isNew: false,
        }));

        // Check if a tool is requested
        if (tools.length > 0) {
            for (const toolInput of tools) {
                await getToolData({
                    toolInput,
                    msgHistory,
                    upsertMessage,
                    controller,
                    activeThread,
                    setState,
                    loops: loops + 1,
                    userId,
                    apiKey,
                });
            }
        } else {
            setState((prevState) => ({
                ...prevState,
                saved: false,
                botTyping: false,
                isNew: false,
            }));
        }
    } catch (error: any) {
        if (error.name === 'AbortError') {
            //console.log('Fetch aborted');
        } else {
            //console.error('Error:', error);
        }
        setState((prevState) => ({
            ...prevState,
            botTyping: false,
            saved: false,
        }));
    }
}

async function requestTitleStream(
    msgHistory: Message[],
    input: string,
    userId?: string | null,
    apiKey?: string,
) {
    // Prepare the chat history
    const history = msgHistory.map((msg) => msg.role + ': ' + msg.content);
    history.push('user: ' + input);
    const historyStr = history.join('\n');

    if (userId && !apiKey) {
        // user server-side key
        const res = await fetch('/api/get_title', {
            method: 'POST',
            body: JSON.stringify({
                history: historyStr,
            }),
        });
        if (!res.body) {
            throw new Error('No response body from /api/get_title');
        }

        return res.body;
    } else if (apiKey) {
        // use client-side key
        return await getTitleStream(historyStr, apiKey);
    }

    throw new Error('No API key or user ID');
}

async function requestChatStream(
    activeThread: ChatThread,
    signal: AbortSignal,
    msgHistory: Message[],
    userId?: string | null,
    apiKey?: string,
) {
    if (userId && !apiKey) {
        // use server-side key
        const response = await fetch('/api/chat', {
            method: 'POST',
            signal,
            body: JSON.stringify({
                activeThread,
                msgHistory,
            }),
        });

        if (!response.body) {
            throw new Error('No response body from /api/chat');
        }

        return response.body;
    } else if (apiKey) {
        // use client-side key
        return await getChatStream(activeThread, msgHistory, signal, apiKey);
    }

    throw new Error('No API key or user ID');
}

type ToolDataParams = {
    toolInput: ToolInput;
    msgHistory: Message[];
    upsertMessage: (message: Message) => void;
    controller: AbortController;
    activeThread: ChatThread;
    setState: Dispatch<SetStateAction<ChatState>>;
    loops?: number;
    userId?: string | null;
    apiKey?: string;
};

export async function getToolData({
    toolInput,
    msgHistory,
    upsertMessage,
    controller,
    activeThread,
    setState,
    loops,
    userId,
    apiKey,
}: ToolDataParams) {
    const tool = toolInput.name;

    const assistantMsg = createFunctionCallMsg(toolInput);

    msgHistory.push(assistantMsg);
    upsertMessage(assistantMsg);

    const res = await callTool(toolInput);
    if (!res) {
        throw new Error('Tool failure');
    }

    const functionMsg: Message = {
        id: uuidv4(),
        content: res,
        role: 'function',
        name: tool,
    };

    msgHistory.push(functionMsg);
    upsertMessage(functionMsg);

    // Add a new function message with the response from the tool
    // Recursively call this function to generate the next response from the AI model
    await getChat({
        msgHistory,
        controller,
        activeThread,
        loops,
        setState,
        upsertMessage,
        userId,
        apiKey,
    });
}
