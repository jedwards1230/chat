import { v4 as uuid } from 'uuid';
import { modelMap } from './models';

export const defaultAgentConfig: AgentConfig = {
    id: uuid(),
    name: 'Chat',
    tools: ['search', 'wikipedia-api'],
    toolsEnabled: true,
    model: modelMap['gpt-4'],
    systemMessage: 'You are a helpful assistant.',
};

const softwareDeveloperAgentConfig: Partial<AgentConfig> = {
    name: 'Software Developer',
    systemMessage:
        'You are a senior software developer. You write clean, commented, efficient code.',
};

const chefAgentConfig: Partial<AgentConfig> = {
    name: 'Chef',
    systemMessage:
        'You are a professional chef, you cook and prepare meals in a variety of cuisines, and provide advice on cooking techniques and ingredients.',
};

const researchAssistantAgentConfig: Partial<AgentConfig> = {
    name: 'Research Assistant',
    systemMessage:
        'You are a research assistant. ' +
        'You use wikipedia and the web browser to find information requested by the user.' +
        'Always remember to cite your sources and use markdown to format your answers.',
    tools: ['search', 'wikipedia-api', 'web-browser'],
};

const modified = [
    softwareDeveloperAgentConfig,
    chefAgentConfig,
    researchAssistantAgentConfig,
];

export const defaultAgents: AgentConfig[] = [
    defaultAgentConfig,
    ...modified.map((config) => modify(defaultAgentConfig, config)),
];

function modify(config: AgentConfig, props: Partial<AgentConfig>): AgentConfig {
    return {
        ...config,
        ...props,
        id: uuid(),
    };
}
