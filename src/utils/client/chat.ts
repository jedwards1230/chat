'use client';

import { Dispatch, SetStateAction } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { prepareMessages } from '..';
import { readStream, callTool, parseStreamData } from '../client';

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

/**
 * This function fetches the title for a given input text.
 * It sends a POST request to the '/api/get_title' endpoint with the chat history and input as the body.
 * It then processes the response stream and calls the provided callback function with the title as the argument.
 *
 * @param {ChatThread} activeThread - The active thread of the chatbot.
 * @param {string} input - The input text to fetch the title for.
 * @param {(title: string) => void} callback - The callback function to be called with the fetched title.
 */
export async function fetchTitle(
    activeThread: ChatThread,
    input: string,
    callback: (title: string) => void,
) {
    const l = activeThread.messages.length;
    if (l < 2 || l > 10) return;

    // Prepare the chat history
    const history = activeThread.messages.map(
        (msg) => msg.role + ': ' + msg.content,
    );
    history.push('user: ' + input);

    // Send POST request to the '/api/get_title' endpoint
    const res = await fetch('/api/get_title', {
        method: 'POST',
        body: JSON.stringify({
            history: history.join('\n'),
        }),
    });
    if (!res.body) {
        throw new Error('No response body from /api/get_title');
    }

    // Function to reduce the response stream data
    const reduceStreamData = (acc: string, curr: StreamData) => {
        if (!curr || !curr.choices) return acc;
        const res = curr.choices[0];
        if (res.finish_reason) {
            return acc;
        }
        if (res.delta.function_call) {
            throw new Error('Function call in get_title');
        }
        return acc + res.delta.content;
    };

    // Callback function to handle each chunk of the response stream
    const streamCallback = (chunk: string) => {
        const chunks = parseStreamData(chunk);
        const accumulatedResponse = chunks.reduce(reduceStreamData, '');

        // Call the provided callback function with the fetched title
        callback(accumulatedResponse);
    };

    // Read the response stream
    await readStream(res.body, streamCallback);
}

/**
 * This function interacts with the AI model to generate responses for the chatbot.
 * It checks if the AI model requests a tool, and if so, recursively replies with tool messages.
 * The recursion is broken when the AI response doesn't request a tool.
 *
 * @param {Message[]} msgHistory - The history of messages in the conversation.
 * @param {AbortController} controller - Used to optionally abort DOM requests.
 * @param {ChatThread} activeThread - The active thread of the chatbot.
 * @param {number} loops - The number of recursive calls made to this function. Default is 0.
 * @param {Dispatch<SetStateAction<ChatState>>} setState - The state setter function from the useState React Hook.
 * @param {(message: Message) => void} upsertMessage - Function to add a new message or update an existing one.
 */
export async function getChat(
    msgHistory: Message[],
    controller: AbortController,
    activeThread: ChatThread,
    loops: number = 0,
    setState: Dispatch<SetStateAction<ChatState>>,
    upsertMessage: (message: Message) => void,
) {
    try {
        if (loops > MAX_LOOPS) {
            throw new Error('Too many loops');
        }

        const assistantId = uuidv4();
        let tool: Tool | null = null;
        let toolInput: string = '';
        let accumulatedResponse = '';
        let error: any | null = null;
        //let finishReason: string | null = null;

        // Function to reduce the response stream data
        const reduceStreamData = (acc: string, curr: StreamData) => {
            if (!curr || !curr.choices) {
                if (curr && curr.error) {
                    error = JSON.stringify(curr.error);
                }
                return acc;
            }
            const res = curr.choices[0];
            if (res.finish_reason) {
                //finishReason = res.finish_reason;
                return acc;
            }
            if (res.delta.function_call) {
                if (res.delta.function_call.name) {
                    tool = res.delta.function_call.name as Tool;
                }
                if (res.delta.function_call.arguments) {
                    toolInput += res.delta.function_call.arguments;
                }
                return acc;
            }
            return acc + res.delta.content;
        };

        // Callback function to handle each chunk of the response stream
        const streamCallback = (chunk: string) => {
            toolInput = '';

            try {
                const err: {
                    error: {
                        code: null;
                        message: string;
                        param: null;
                        type: string;
                    };
                } = JSON.parse(chunk);
                accumulatedResponse = `ERROR: ${err.error.message}`;
            } catch (err) {
                const chunks = parseStreamData(chunk);
                accumulatedResponse = chunks.reduce(reduceStreamData, '');
            }

            if (!tool) {
                upsertMessage({
                    id: assistantId,
                    content: error || accumulatedResponse,
                    role: 'assistant',
                });
            }
        };

        // Set botTyping state to true
        setState((prevState) => ({
            ...prevState,
            botTyping: true,
        }));

        const stream = await requestChatStream(
            activeThread,
            controller.signal,
            msgHistory,
        );

        // Read the response stream
        await readStream(stream, streamCallback);

        // Set chat state
        setState((prevState) => ({
            ...prevState,
            saved: false,
            isNew: false,
        }));

        // Check if a tool is requested
        if (tool) {
            await getToolData(
                tool,
                toolInput,
                msgHistory,
                upsertMessage,
                controller,
                activeThread,
                setState,
                loops + 1,
            );
        } else {
            setState((prevState) => {
                return {
                    ...prevState,
                    saved: false,
                    botTyping: false,
                    isNew: false,
                };
            });
        }
    } catch (error: any) {
        if (error.name === 'AbortError') {
            //console.log('Fetch aborted');
        } else {
            console.error('Error:', error);
        }
        setState((prevState) => ({
            ...prevState,
            botTyping: false,
            saved: false,
        }));
    }
}

async function requestChatStream(
    activeThread: ChatThread,
    signal: AbortSignal,
    msgHistory: Message[],
) {
    const messages = prepareMessages(msgHistory);
    const response = await fetch('/api/chat', {
        method: 'POST',
        signal,
        body: JSON.stringify({
            modelName: activeThread.agentConfig.model,
            temperature: activeThread.agentConfig.temperature,
            messages,
            tools: activeThread.agentConfig.toolsEnabled
                ? activeThread.agentConfig.tools
                : [],
        }),
    });

    if (!response.body) {
        throw new Error('No response body from /api/chat');
    }

    return response.body;
}

async function getToolData(
    tool: Tool,
    toolInput: string,
    msgHistory: Message[],
    upsertMessage: (message: Message) => void,
    controller: AbortController,
    activeThread: ChatThread,
    setState: Dispatch<SetStateAction<ChatState>>,
    loops: number = 0,
) {
    let input = '';
    try {
        if (tool !== 'web-browser') {
            const cleaned = JSON.parse(toolInput);
            input = cleaned.input;
        } else {
            input = toolInput;
        }
    } catch (err) {
        input = toolInput;
    }

    const assistantMsg: Message = {
        id: uuidv4(),
        content: input,
        role: 'assistant',
        name: tool,
        function_call: {
            name: tool,
            arguments: input,
        },
    };

    msgHistory.push(assistantMsg);
    upsertMessage(assistantMsg);

    const res = await callTool(tool, input);
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
    await getChat(
        msgHistory,
        controller,
        activeThread,
        loops,
        setState,
        upsertMessage,
    );
}
