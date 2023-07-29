type Tool = 'calculator' | 'search' | 'web-browser' | 'wikipedia-api';

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
