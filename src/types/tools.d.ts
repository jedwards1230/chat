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
