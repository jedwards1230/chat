export function parseInput(input: any, tool: Tool): string {
    switch (tool) {
        case 'web-browser':
            try {
                const parsed = JSON.parse(input);
                const query = typeof parsed === 'string' ? parsed : parsed.url;
                return query;
            } catch {
                const query = typeof input === 'string' ? input : input.url;
                return query;
            }
        case 'wikipedia-api':
        case 'calculator':
        case 'search':
        default:
            return input;
    }
}
