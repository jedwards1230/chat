type GPT3 = 'gpt-3.5-turbo' | 'gpt-3.5-turbo-16k';
type GPT4 = 'gpt-4' | 'gpt-4-0613';

type AppSettingsSection = 'General' | 'Credentials' | 'Data';

type OpenAiModels = GPT3 | GPT4;
type LlamaModels = 'llama-2-7b-chat-int8';

type Model = OpenAiModels | LlamaModels;

type ApiProvider = 'openai' | 'llama';

type ModelParams = {
    temperature?: number;
    topP?: number;
    N?: number;
    maxTokens?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
};

interface ModelInfo {
    name: Model;
    api: ApiProvider;
    params: ModelParams;
}

interface OpenAiModelInfo extends ModelInfo {
    name: OpenAiModels;
    api: 'openai';
}

interface LlamaModelInfo extends ModelInfo {
    name: LlamaModels;
    api: 'llama';
}

type ModelApi = OpenAiModelInfo | LlamaModelInfo;

type Role = 'system' | 'user' | 'assistant' | 'function';

type Message = {
    id: string;
    content: string | null;
    role: Role;
    createdAt?: Date;
    name?: Tool;
    function_call?: {
        name: string;
        arguments: string | { input: string };
    };
};

interface AgentConfig {
    id: string;
    name: string;
    tools: Tool[];
    toolsEnabled: boolean;
    model: ModelApi;
    systemMessage: string;
}

interface ChatThread {
    created: Date;
    lastModified: Date;
    id: string;
    title: string;
    messages: Message[];
    agentConfig: AgentConfig;
}

interface SaveData {
    chatHistory: ChatThread[];
    config: {
        model: ModelApi;
        temperature: number;
        systemMessage: string;
        topP: number;
        N: number;
        maxTokens: number;
        frequencyPenalty: number;
        presencePenalty: number;
    };
}

interface ShareData {
    thread: ChatThread;
}

type Choice = {
    delta: {
        function_call?: {
            arguments?: string;
            name?: string;
        };
        content?: string;
    };
    finish_reason: 'function_call' | null;
    index: number;
};

interface StreamData {
    error?: {
        code: string | null;
        message: string;
        param: string | null;
        type: string;
    };
    choices?: Choice[];
    created: number;
    id: string;
    model: Model;
    object: string;
}

interface SearchResult {
    /** Query used with Search Engine API */
    query: string;
    url: string;
    snippet: string;
    title: string;
    /** AI-generated summary */
    content?: string;
    error?: string;
    /** Finished analysis for primary chat */
    reviewed?: boolean;
    /** Fime taken to store text embeddings  */
    timeToComplete?: number;
}

type User =
    | {
          name?: string | null;
          email?: string | null;
          image?: string | null;
      }
    | undefined;
