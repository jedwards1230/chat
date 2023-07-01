import { AIChatMessage, HumanChatMessage, LLMResult } from "langchain/schema";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { Callbacks } from "langchain/dist/callbacks";

export const runtime = "edge";

export async function POST(request: Request) {
	const res = await request.json();
	const {
		input,
		msgHistory,
		modelName,
	}: {
		input: string;
		msgHistory: Message[];
		modelName: Model;
	} = res;

	if (!input) {
		return new Response("No query", {
			status: 400,
		});
	}

	if (!msgHistory) {
		return new Response("No message history", {
			status: 400,
		});
	}

	const messages = msgHistory.map((msg) => {
		if (msg.role === "user") {
			return new HumanChatMessage(msg.content);
		} else if (msg.role === "function") {
			console.log("Function call", msg.function_call);
			return new AIChatMessage(msg.function_call);
		} else {
			return new AIChatMessage(msg.content);
		}
	});

	messages.push(new HumanChatMessage(input));

	const stream = new ReadableStream({
		async start(controller) {
			const encoder = new TextEncoder();

			const callbacks: Callbacks = [
				{
					handleLLMNewToken(token: string, idx, runId) {
						const queue = encoder.encode(token);
						controller.enqueue(queue);
					},
				},
				{
					handleLLMEnd(output, runId) {
						const out = output.generations[0][0];
						if (out) {
							controller.close();
						}
					},
				},
				{
					handleText(text, runId) {
						console.log({ text });
					},
				},
				{
					handleAgentAction(action, runId) {
						//console.log("Action", action);
					},
				},
				{
					handleLLMError(error) {
						console.error(error);
					},
				},
				{
					handleChainError(error) {
						console.error(error);
					},
				},
				{
					handleToolError(error) {
						console.error(error);
					},
				},
			];

			const llm = new ChatOpenAI({
				modelName: modelName,
				temperature: 0,
				streaming: true,
				callbacks,
			});

			const response = await llm.predictMessages(messages);

			// this should break the stream and return just a json object of response
			if (response.additional_kwargs.function_call) {
				/* console.log(
					"Function call",
					response.additional_kwargs.function_call
				); */
			}

			controller.close();
		},
	});

	return new Response(stream, {
		headers: {
			"content-type": "text/event-stream",
		},
	});
}
