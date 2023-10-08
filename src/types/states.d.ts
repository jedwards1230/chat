type ChatState = {
    /** Track index of current thread in `threads` */
    currentThreadIdx: number | null;
    /** Track the active thread based on `currentThreadIdx` and `threads` */
    activeThread?: ChatThread;
    /** Store all chat threads */
    threads: ChatThread[];
    /** Default thread for creating new chats */
    defaultThread: ChatThread;
    /** Track fetch status */
    botTyping: boolean;
    /** User input */
    input: string;
    /** Message to edit */
    editId: string | null;
    /** Abort chat */
    abortController: AbortController;
    /** Setting this to false will trigger a save */
    saved: boolean;
    /** Store character profiles */
    characterList: AgentConfig[];
    /** Store OpenAI API key */
    openAiApiKey?: string;
    /** Whether to the chat response */
    streamResponse: boolean;

    /** Abort request, stop typing, request a save */
    abortRequest: () => void;
    /** Abort request, set default thread, save */
    createThread: () => void;
    /** Toggle plugin for active thread */
    toggleplugin: (plugin: Tool) => void;
    saveCharacter: (character: AgentConfig) => Promise<void>;
    updateThreadConfig: (config: Partial<AgentConfig>) => void;
    setSystemMessage: (message: string) => void;
    editMessage: (messageId: string) => void;
    /** Add a message to the thread without triggering a response */
    addMessage: (message: ChatMessage, activeThread: ChatThread) => void;
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
