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

export async function fetchTitle(
    activeThread: ChatThread,
    input: string,
    callback: (title: string) => void,
) {
    const l = activeThread.messages.length;
    if (l < 2 || l > 10) return;

    const history = activeThread.messages.map(
        (msg) => msg.role + ': ' + msg.content,
    );
    history.push('user: ' + input);

    const res = await fetch('/api/get_title', {
        method: 'POST',
        body: JSON.stringify({
            history: history.join('\n'),
        }),
    });
    if (!res.body) {
        throw new Error('No response body from /api/get_title');
    }

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

    const streamCallback = (chunk: string) => {
        const chunks = parseStreamData(chunk);
        const accumulatedResponse = chunks.reduce(reduceStreamData, '');

        callback(accumulatedResponse);
    };

    await readStream(res.body, streamCallback);
}

export const getChat = async (
    msgHistory: Message[],
    controller: AbortController,
    activeThread: ChatThread,
    loops: number = 0,
    setState: Dispatch<SetStateAction<ChatState>>,
    upsertMessage: (message: Message) => void,
) => {
    try {
        if (loops > MAX_LOOPS) {
            throw new Error('Too many loops');
        }
        setState((prevState) => {
            return {
                ...prevState,
                botTyping: true,
            };
        });
        const signal = controller.signal;

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

        const assistantId = uuidv4();
        let tool: Tool | null = null;
        let toolInput: string = '';
        let accumulatedResponse = '';
        let error: any | null = null;
        //let finishReason: string | null = null;

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

        const streamCallback = (chunk: string) => {
            toolInput = '';

            const chunks = parseStreamData(chunk);
            accumulatedResponse = chunks.reduce(reduceStreamData, '');

            if (!tool) {
                upsertMessage({
                    id: assistantId,
                    content: error || accumulatedResponse,
                    role: 'assistant',
                });
            }
        };

        await readStream(response.body, streamCallback);
        setState((prevState) => {
            return {
                ...prevState,
                saved: false,
                botTyping: false,
                isNew: false,
            };
        });

        if (tool) {
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

            getChat(
                msgHistory,
                controller,
                activeThread,
                loops + 1,
                setState,
                upsertMessage,
            );
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
};
