type ChatState = {
    activeThread: ChatThread;
    threads: ChatThread[];
    config: AgentConfig;
    botTyping: boolean;
    input: string;
    editId: string | null;
    abortController: AbortController;
    saved: boolean;
    characterList: AgentConfig[];
    /**
     * TODO: do i still need this?
     * isNew is a state variable, set to true when a new thread is created due to absence of a threadId or non-existence of the threadId in state.threads
     *
     * It is set to false when an existing thread is made active based on the provided threadId
     */
    isNew: boolean;

    /** Abort request, stop typing, request a save */
    abortRequest: () => void;
    updateActiveThread: (thread: ChatThread) => void;
    createThread: () => void;
    toggleplugin: (plugin: Tool) => void;
    setConfig: (config: AgentConfig) => void;
    updateThreadConfig: (config: Partial<AgentConfig>) => void;
    setSystemMessage: (message: string) => void;
    editMessage: (messageId: string) => void;
    removeMessage: (messageId: string) => void;
    removeThread: (threadId: string) => void;
    removeAllThreads: () => void;
    setPluginsEnabled: (enabled: boolean) => void;
    changeInput: (input: string) => void;
    cancelEdit: () => void;
    handleSubmit: (e: React.FormEvent) => void;
};
