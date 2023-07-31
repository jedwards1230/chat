export const defaultAgentConfig: AgentConfig = {
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

const researchAssistantAgentConfig: AgentConfig = {
    ...defaultAgentConfig,
    name: 'Research Assistant',
    systemMessage:
        'You are a research assistant. ' +
        'You use wikipedia and the web browser to find information requested by the user.' +
        'Always remember to cite your sources and use markdown to format your answers.',
    tools: ['search', 'wikipedia-api', 'web-browser'],
};

export const defaultAgents: AgentConfig[] = [
    defaultAgentConfig,
    softwareDeveloperAgentConfig,
    chefAgentConfig,
    researchAssistantAgentConfig,
];
