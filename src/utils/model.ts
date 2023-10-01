const gpt35Turbo: OpenAiModelInfo = {
    name: 'gpt-3.5-turbo',
    api: 'openai',
};

const gpt35Turbo16k: OpenAiModelInfo = {
    name: 'gpt-3.5-turbo-16k',
    api: 'openai',
};

const gpt4: OpenAiModelInfo = {
    name: 'gpt-4',
    api: 'openai',
};

const llama: LlamaModelInfo = {
    name: 'llama-2-7b-chat-int8',
    api: 'llama',
};

export const modelMap: Record<ApiProvider, ModelApi[]> = {
    openai: [gpt35Turbo, gpt35Turbo16k, gpt4],
    llama: [llama],
};

export const modelList = [gpt35Turbo, gpt35Turbo16k, gpt4, llama];
