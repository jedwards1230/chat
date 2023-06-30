import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { Callbacks } from "langchain/dist/callbacks";

export const runtime = "edge";

export async function POST(request: Request) {
	const res = await request.json();
	const {
		history,
	}: {
		history: string;
	} = res;

	if (!history) {
		return new Response("No history", {
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
				modelName: "gpt-3.5-turbo",
				temperature: 0,
				streaming: true,
				callbacks,
			});

			await llm.call([
				new SystemChatMessage(
					"You are a helpful assistant that generates a brief chat title based on provided chat messages. " +
						"Provide only the string for the title. No quotes or labels are necessary."
				),
				new HumanChatMessage(
					"Messages Start:\n" + history + "\nMessages End"
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
