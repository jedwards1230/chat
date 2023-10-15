type Tool = 'calculator' | 'search' | 'web-browser' | 'wikipedia-api';

type Command = '/calculator' | '/search' | '/scrape' | '/wiki';

type CustomTool = {
    name: Tool;
    description: string;
    parameters: {
        type: string;
        required: string[];
        properties: {
            [key: string]: {
                description: string;
                type: string;
            };
        };
    };
};

type ToolInput = {
    name: Tool;
    args: any;
};

type CommandList = Record<Command, ToolInput>;

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
