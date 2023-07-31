export class Search implements CustomTool {
    name: Tool = 'search';
    description =
        'custom search engine. useful for when you need to answer questions about current events.' +
        'input should be a single search query. outputs a JSON array of results.';
    parameters = {
        type: 'object',
        properties: {
            input: {
                type: 'string',
                description: 'The search query',
            },
        },
        required: ['input'],
    };

    async searchGoogle(
        input: string,
        googleApiKey?: string,
        googleCSEId?: string,
    ) {
        const apiKey = process.env.GOOGLE_API_KEY || googleApiKey;
        const CSEId = process.env.GOOGLE_CSE_ID || googleCSEId;

        if (!apiKey || !CSEId) {
            throw new Error(
                'Missing GOOGLE_API_KEY or GOOGLE_CSE_ID environment variables',
            );
        }

        const url = new URL('https://www.googleapis.com/customsearch/v1');
        url.searchParams.set('key', apiKey);
        url.searchParams.set('cx', CSEId);
        url.searchParams.set('q', input);
        url.searchParams.set('start', '1');

        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(
                `Got ${res.status} error from Google custom search: ${res.statusText}`,
            );
        }

        const json = await res.json();

        const results: SearchResult[] =
            json?.items?.map(
                (item: {
                    title?: string;
                    link?: string;
                    snippet?: string;
                }) => ({
                    query: input,
                    title: item.title,
                    url: item.link,
                    snippet: item.snippet,
                }),
            ) ?? [];
        return results;
    }

    async call(input: string) {
        try {
            const results = await this.searchGoogle(input);
            const listItems = results.map((result) => {
                return `Title: ${result.title}\nURL: ${result.url}\nSnippet: ${result.snippet}`;
            });
            return listItems.join('\n\n');
        } catch (error) {
            console.error(error);
            return "I don't know how to do that.";
        }
    }
}

const search = new Search();

export default search;
