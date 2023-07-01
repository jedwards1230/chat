import { openai } from "@/lib/openai";
import { Calculator } from "@/tools/calculator";
import { ChatCompletionRequestMessage } from "openai-edge";

export const runtime = "edge";

export async function POST(request: Request) {
	const res = await request.json();
	const {
		msgHistory,
		modelName,
		temperature,
	}: {
		msgHistory: Message[];
		modelName: Model;
		temperature: number;
	} = res;

	if (!msgHistory) {
		return new Response("No message history", {
			status: 400,
		});
	}
	const messages: ChatCompletionRequestMessage[] = msgHistory.map((msg) => {
		return {
			role: msg.role,
			content: msg.content,
			name: msg.name,
			function_call: msg.function_call,
		};
	});

	const tools = [new Calculator()];

	const completion = await openai.createChatCompletion({
		model: modelName,
		messages,
		//max_tokens: 1024,
		temperature,
		stream: true,
		functions: tools,
	});

	return new Response(completion.body, {
		headers: {
			"content-type": "text/event-stream",
		},
	});
}
