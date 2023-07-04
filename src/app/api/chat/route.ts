import { openai } from "@/lib/openai";
import { Calculator } from "@/tools/calculator";
import { Search } from "@/tools/search";
import { ChatCompletionRequestMessage } from "openai-edge";

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
						}
					})
					.map((tool) => ({
						name: tool.name,
						description: tool.description,
						parameters: tool.parameters,
					}))
			: undefined;

	//console.log({ messages });

	const completion = await openai.createChatCompletion({
		model: modelName,
		messages,
		//max_tokens: 1024,
		temperature,
		stream: true,
		functions,
	});

	return new Response(completion.body, {
		headers: {
			"content-type": "text/event-stream",
		},
	});
}
