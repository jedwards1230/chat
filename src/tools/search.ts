import { searchGoogle } from "@/utils/server";

export class Search implements CustomTool {
	name = "search";
	description =
		"custom search engine. useful for when you need to answer questions about current events." +
		"input should be a single search query. outputs a JSON array of results.";
	parameters = {
		type: "object",
		properties: {
			input: {
				type: "string",
				description: "The search query",
			},
		},
		required: ["input"],
	};

	async call(input: string) {
		try {
			const results = await searchGoogle(input);
			return JSON.stringify(results);
		} catch (error) {
			console.error(error);
			return "I don't know how to do that.";
		}
	}
}
