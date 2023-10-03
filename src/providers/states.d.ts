type ChatState = {
    activeThread: ChatThread;
    threads: ChatThread[];
    botTyping: boolean;
    input: string;
    editId: string | null;
    abortController: AbortController;
    /** Setting this to false will trigger a save */
    saved: boolean;
    characterList: AgentConfig[];
    isNew: boolean;
    openAiApiKey?: string;
    streamResponse: boolean;

    /** Abort request, stop typing, request a save */
    abortRequest: () => void;
    updateActiveThread: (thread: ChatThread) => void;
    /** Abort request, set default thread, save */
    createThread: () => void;
    toggleplugin: (plugin: Tool) => void;
    saveCharacter: (character: AgentConfig) => Promise<void>;
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
    setOpenAiApiKey: (key?: string) => void;
    setStreamResponse: (stream: boolean) => void;
};
