type GPT3 = 'gpt-3.5-turbo' | 'gpt-3.5-turbo-16k';
type GPT4 =
    | 'gpt-4-1106-preview'
    | 'gpt-4-vision-preview'
    | 'gpt-4'
    | 'gpt-4-0613';

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

/** Basic details for calling the API */
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

/** The model used to generate responses */
type ModelApi = OpenAiModelInfo | LlamaModelInfo;

/**
 * User configured settings for the agent.
 */
interface AgentConfig {
    id: string;
    /** Not injected into chat. Simply for the user to organize Agents. */
    name: string;
    /** List of functions for which the Agent has access. */
    tools: Tool[];
    /**
     * Toggles sending list of tools to the API.
     * Will prevent sending tools even if there are tools in the list.
     * */
    toolsEnabled: boolean;
    /** The model used to generate responses */
    model: ModelApi;
    /** System message to steer the Agent. */
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
