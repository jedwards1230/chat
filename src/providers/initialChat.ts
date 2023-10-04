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

const initialState: ChatState = {
    input: '',
    threads: [],
    saved: true,
    isNew: true,
    editId: null,
    currentThread: 0,
    botTyping: false,
    openAiApiKey: '',
    streamResponse: true,
    characterList: defaultAgents,
    abortController: new AbortController(),

    cancelEdit: () => {},
    changeInput: () => {},
    editMessage: () => {},
    abortRequest: () => {},
    createThread: () => {},
    removeThread: () => {},
    toggleplugin: () => {},
    removeMessage: () => {},
    setOpenAiApiKey: () => {},
    removeAllThreads: () => {},
    setSystemMessage: () => {},
    setStreamResponse: () => {},
    setPluginsEnabled: () => {},
    updateThreadConfig: () => {},
    updateActiveThread: () => {},
    handleSubmit: () => Promise.resolve(),
    saveCharacter: () => Promise.resolve(),
};

export default initialState;
