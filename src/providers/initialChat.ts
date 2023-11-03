import { v4 as uuidv4 } from 'uuid';

import { defaultAgents } from './characters';

export function getDefaultThread(config: AgentConfig): ChatThread {
    const systemId = uuidv4();
    return {
        id: uuidv4(),
        title: 'New Chat',
        created: new Date(),
        lastModified: new Date(),
        agentConfig: config,
        mapping: {
            [systemId]: {
                id: systemId,
                message: {
                    id: systemId,
                    role: 'system',
                    content: config.systemMessage,
                },
                parent: null,
                children: [],
            },
        },
        currentNode: systemId,
    };
}

export function resetDefaultThread() {
    return getDefaultThread(defaultAgents[0]);
}

const initialState: ChatState = {
    input: '',
    threads: [],
    saved: true,
    editId: null,
    currentThreadIdx: null,
    defaultThread: resetDefaultThread(),
    botTyping: false,
    openAiApiKey: '',
    streamResponse: true,
    characterList: defaultAgents,
    abortController: new AbortController(),

    clearChat: () => {},
    addMessage: () => {},
    cancelEdit: () => {},
    changeInput: () => {},
    editMessage: () => {},
    abortRequest: () => {},
    createThread: () => {},
    changeBranch: () => {},
    removeThread: () => {},
    toggleplugin: () => {},
    removeMessage: () => {},
    regenerateChat: () => {},
    setOpenAiApiKey: () => {},
    removeAllThreads: () => {},
    setSystemMessage: () => {},
    setStreamResponse: () => {},
    setPluginsEnabled: () => {},
    updateThreadConfig: () => {},
    handleSubmit: () => Promise.resolve(),
    saveCharacter: () => Promise.resolve(),
};

export default initialState;
