import { Calculator } from "@/tools/calculator";
import { Configuration, OpenAIApi } from "openai-edge";

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

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
	const messages = msgHistory.map((msg) => {
		return {
			role: msg.role,
			content: msg.content,
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
