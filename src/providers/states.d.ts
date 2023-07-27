type ChatState = {
    activeThread: ChatThread;
    threads: ChatThread[];
    config: Config;
    botTyping: boolean;
    input: string;
    editId: string | null;
    pluginsEnabled: boolean;
    abortController?: AbortController;
    saved: boolean;

    abortRequest: () => void;
    updateActiveThread: (thread: ChatThread) => void;
    resetAbortController: () => void;
    createThread: () => void;
    toggleplugin: (plugin: Tool) => void;
    setConfig: (config: Config) => void;
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
