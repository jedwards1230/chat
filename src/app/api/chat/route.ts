import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { AIChatMessage, HumanChatMessage } from "langchain/schema";
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
					handleAgentAction(action, runId) {
						console.log("Action", action);
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

			const memory = new BufferMemory({
				chatHistory: new ChatMessageHistory(messages),
				returnMessages: true,
				memoryKey: "chat_history",
			});

			const tools = [new Calculator()];

			const llm = new ChatOpenAI({
				//modelName: "gpt-4-0613",
				modelName: "gpt-3.5-turbo-16k",
				temperature: 0,
				streaming: true,
				callbacks,
			});

			const executor = await initializeAgentExecutorWithOptions(
				tools,
				llm,
				{
					agentType: "openai-functions",
					// returnIntermediateSteps: true,
					memory,
					callbacks,
				}
			);

			await executor.call({ input });

			controller.close();
		},
	});

	return new Response(stream, {
		headers: {
			"content-type": "text/event-stream",
		},
	});
}
