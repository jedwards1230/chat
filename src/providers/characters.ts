export const defaultAgentConfig: AgentConfig = {
    id: '',
    name: 'Chat',
    tools: ['search', 'wikipedia-api'],
    toolsEnabled: true,
    model: 'gpt-4',
    temperature: 0.7,
    systemMessage: 'You are a helpful assistant.',
    topP: 1,
    N: 1,
    maxTokens: -1,
    frequencyPenalty: 0,
    presencePenalty: 0,
};

const softwareDeveloperAgentConfig: AgentConfig = {
    ...defaultAgentConfig,
    name: 'Software Developer',
    systemMessage:
        'You are a senior software developer. You write clean, commented, efficient code.',
};

const chefAgentConfig: AgentConfig = {
    ...defaultAgentConfig,
    name: 'Chef',
    systemMessage:
        'You are a professional chef, you cook and prepare meals in a variety of cuisines, and provide advice on cooking techniques and ingredients.',
};

export const defaultAgents: AgentConfig[] = [
    defaultAgentConfig,
    softwareDeveloperAgentConfig,
    chefAgentConfig,
];
