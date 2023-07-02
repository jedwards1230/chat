import { searchGoogle } from "@/utils";

export class Search implements CustomTool {
	name = "search";
	description =
		"a custom search engine. useful for when you need to answer questions about current events. input should be a search query. outputs a JSON array of results.";
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
			console.log(results);
			return JSON.stringify(results, null, 2);
		} catch (error) {
			return "I don't know how to do that.";
		}
	}
}
