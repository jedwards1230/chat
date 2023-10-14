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

interface ChatFunction {
    /**
     * The name of the function to be called. Must be a-z, A-Z, 0-9, or contain
     * underscores and dashes, with a maximum length of 64.
     */
    name: string;

    /**
     * The parameters the functions accepts, described as a JSON Schema object. See the
     * [guide](https://platform.openai.com/docs/guides/gpt/function-calling) for
     * examples, and the
     * [JSON Schema reference](https://json-schema.org/understanding-json-schema/) for
     * documentation about the format.
     *
     * To describe a function that accepts no parameters, provide the value
     * `{"type": "object", "properties": {}}`.
     */
    parameters: Record<string, unknown>;

    /**
     * A description of what the function does, used by the model to choose when and
     * how to call the function.
     */
    description?: string;
}
