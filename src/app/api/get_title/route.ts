import {
	AIChatMessage,
	HumanChatMessage,
	SystemChatMessage,
} from "langchain/schema";
import { Calculator } from "langchain/tools/calculator";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { Callbacks } from "langchain/dist/callbacks";

export const runtime = "edge";

export async function POST(request: Request) {
	const res = await request.json();
	const {
		input,
		msgHistory,
	}: {
		input: string;
		msgHistory: Message[];
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

	const stream = new ReadableStream({
		async start(controller) {
			const encoder = new TextEncoder();

			const callbacks: Callbacks = [
				{
					handleLLMNewToken(token: string) {
						const queue = encoder.encode(token);
						controller.enqueue(queue);
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
			];

			const llm = new ChatOpenAI({
				modelName: "gpt-3.5-turbo-16k",
				temperature: 0,
				streaming: true,
				callbacks,
			});
			const messages = msgHistory.map((msg) => JSON.stringify(msg));
			messages.push(input);

			await llm.call([
				new SystemChatMessage(
					"You are a helpful assistant that generates a brief chat title based on provided chat messages. " +
						"Provide only the string for the title. No quotes or labels are necessary."
				),
				new HumanChatMessage(
					"Messages Start:\n" + messages.join("\n") + "\nMessages End"
				),
			]);

			controller.close();
		},
	});

	return new Response(stream, {
		headers: {
			"content-type": "text/event-stream",
		},
	});
}
