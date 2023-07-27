'use client';

import { v4 as uuidv4 } from 'uuid';

const systemMessage = 'You are a helpful assistant.';

const defaultConfig: Config = {
    model: 'gpt-4',
    temperature: 0.7,
    systemMessage: systemMessage,
    topP: 1,
    N: 1,
    maxTokens: -1,
    frequencyPenalty: 0,
    presencePenalty: 0,
};

export function getDefaultThread(config: Config): ChatThread {
    return {
        id: uuidv4(),
        title: 'New Chat',
        created: new Date(),
        lastModified: new Date(),
        messages: [
            {
                id: uuidv4(),
                role: 'system',
                content: systemMessage,
            },
        ],
        agentConfig: {
            ...defaultConfig,
            ...config,
            id: '',
            name: 'Chat',
            tools: ['search', 'wikipedia-api'],
        },
    };
}

const baseEntry = getDefaultThread(defaultConfig);

const initialState: ChatState = {
    abortRequest: () => {},
    createThread: () => {},
    activeThread: baseEntry,
    editId: null,
    editMessage: () => {},
    removeMessage: () => {},
    removeThread: () => {},
    removeAllThreads: () => {},
    setSystemMessage: () => {},
    botTyping: false,
    config: defaultConfig,
    toggleplugin: () => {},
    setConfig: () => {},
    pluginsEnabled: true,
    setPluginsEnabled: () => {},
    updateThreadConfig: () => {},
    saved: true,

    threads: [],
    updateActiveThread: () => {},
    input: '',
    changeInput: () => {},
    abortController: undefined,
    resetAbortController: () => {},

    handleSubmit: () => Promise.resolve(),
    cancelEdit: () => {},
};

export default initialState;
