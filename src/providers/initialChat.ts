'use client';

import { v4 as uuidv4 } from 'uuid';

const systemMessage = 'You are a helpful assistant.';

export const defaultAgentConfig: AgentConfig = {
    id: '',
    name: 'Chat',
    tools: ['search', 'wikipedia-api'],
    toolsEnabled: true,
    model: 'gpt-4',
    temperature: 0.7,
    systemMessage: systemMessage,
    topP: 1,
    N: 1,
    maxTokens: -1,
    frequencyPenalty: 0,
    presencePenalty: 0,
};

const softwareDeveloperAgentConfig: AgentConfig = {
    ...defaultAgentConfig,
    name: 'Software Developer',
    systemMessage:
        'You are a senior software developer. You write clean, commented, efficient code.',
};

export const defaultAgents: AgentConfig[] = [
    defaultAgentConfig,
    softwareDeveloperAgentConfig,
];

export function getDefaultThread(config: AgentConfig): ChatThread {
    return {
        id: uuidv4(),
        title: 'New Chat',
        created: new Date(),
        lastModified: new Date(),
        agentConfig: config,
        messages: [
            {
                id: uuidv4(),
                role: 'system',
                content: config.systemMessage,
            },
        ],
    };
}

const baseEntry = getDefaultThread(defaultAgentConfig);

const initialState: ChatState = {
    input: '',
    threads: [],
    saved: true,
    isNew: true,
    editId: null,
    botTyping: false,
    config: defaultAgentConfig,
    activeThread: baseEntry,
    abortController: new AbortController(),

    setConfig: () => {},
    cancelEdit: () => {},
    changeInput: () => {},
    editMessage: () => {},
    abortRequest: () => {},
    createThread: () => {},
    removeThread: () => {},
    toggleplugin: () => {},
    removeMessage: () => {},
    removeAllThreads: () => {},
    setSystemMessage: () => {},
    setPluginsEnabled: () => {},
    updateThreadConfig: () => {},
    updateActiveThread: () => {},
    handleSubmit: () => Promise.resolve(),
};

export default initialState;
