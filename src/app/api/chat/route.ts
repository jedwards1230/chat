import { ChatCompletionRequestMessage } from "openai-edge";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

import { openai } from "@/lib/openai";
import { Calculator } from "@/tools/calculator";
import { Search } from "@/tools/search";
import { WebBrowser } from "@/tools/webBrowser";

export const runtime = "edge";

export async function POST(request: Request) {
	const res = await request.json();
	const {
		msgHistory,
		modelName,
		temperature,
		tools,
	}: {
		msgHistory: Message[];
		modelName: Model;
		temperature: number;
		tools: Tool[];
	} = res;

	if (!msgHistory) {
		return new Response("No message history", {
			status: 400,
		});
	}
	const messages: ChatCompletionRequestMessage[] = msgHistory.map((msg) => {
		if (msg.role === "system") {
			return {
				role: msg.role,
				content: `${
					msg.content
				}\n\nCurrent time: ${new Date().toLocaleString()}\n\n`,
			};
		}
		return {
			role: msg.role,
			content: msg.content,
			name: msg.name,
			function_call: msg.function_call,
		};
	});

	const functions =
		tools && tools.length > 0
			? tools
					.map((tool) => {
						switch (tool) {
							case "calculator":
								return new Calculator();
							case "search":
								return new Search();
							case "web-browser":
								const model = new ChatOpenAI({
									temperature: 0,
									modelName: "gpt-3.5-turbo-16k",
								});
								const embeddings = new OpenAIEmbeddings();
								return new WebBrowser({ model, embeddings });
						}
					})
					.map((tool) => ({
						name: tool.name,
						description: tool.description,
						parameters: tool.parameters,
					}))
			: undefined;

	const completion = await openai.createChatCompletion({
		model: modelName,
		messages,
		temperature,
		stream: true,
		functions,
		//top_p: 1,
		//n: 1,
		//stop,
		//max_tokens: 1024,
		//presence_penalty: 0,
		//frequency_penalty: 0,
		//logit_bias: {},
		//user: "",
	});

	return new Response(completion.body, {
		headers: {
			"content-type": "text/event-stream",
		},
	});
}
