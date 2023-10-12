type GPT3 = 'gpt-3.5-turbo' | 'gpt-3.5-turbo-16k';
type GPT4 = 'gpt-4' | 'gpt-4-0613';

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

interface AgentConfig {
    id: string;
    name: string;
    tools: Tool[];
    toolsEnabled: boolean;
    model: ModelApi;
    systemMessage: string;
}
