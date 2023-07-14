import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { NextResponse } from "next/server";

import { Calculator } from "@/tools/calculator";
import { Search } from "@/tools/search";
import { WebBrowser } from "@/tools/webBrowser";
import { WikipediaQueryRun } from "@/tools/wikipedia";

export const runtime = "edge";

export async function POST(request: Request) {
	const res = await request.json();
	const {
		tool,
		input,
	}: {
		tool: Tool;
		input: string;
	} = res;

	if (!tool) {
		return new Response("No tool", {
			status: 400,
		});
	}

	if (!input) {
		return new Response("No input", {
			status: 400,
		});
	}

	let result = "";
	switch (tool) {
		case "calculator":
			result = new Calculator().call(input);
			break;
		case "search":
			result = await new Search().call(input);
			break;
		case "web-browser":
			const model = new ChatOpenAI({
				temperature: 0.3,
				modelName: "gpt-3.5-turbo-16k",
			});
			const embeddings = new OpenAIEmbeddings();
			result = await new WebBrowser({ model, embeddings }).call(input);
			break;
		case "wikipedia-api":
			result = await new WikipediaQueryRun().call(input);
			break;
		default:
			return new Response("Invalid tool", {
				status: 400,
			});
	}

	return NextResponse.json(result);
}
