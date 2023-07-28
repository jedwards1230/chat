'use client';

import { v4 as uuidv4 } from 'uuid';
import { defaultAgentConfig, defaultAgents } from './characters';

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
    characterList: defaultAgents,
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
