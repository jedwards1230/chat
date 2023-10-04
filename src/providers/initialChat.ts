import { v4 as uuidv4 } from 'uuid';

import { defaultAgentConfig, defaultAgents } from './characters';

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

const baseEntry = getDefaultThread(defaultAgentConfig);

const initialState: ChatState = {
    input: '',
    threads: [],
    saved: true,
    isNew: true,
    editId: null,
    botTyping: false,
    openAiApiKey: '',
    streamResponse: true,
    activeThread: baseEntry,
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
