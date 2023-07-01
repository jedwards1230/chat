import { openai } from "@/lib/openai";

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

	const completion = await openai.createChatCompletion({
		model: "gpt-3.5-turbo",
		messages: [
			{
				role: "system",
				content:
					"You are a helpful assistant that generates a brief chat title based on provided chat messages. " +
					"Provide only the string for the title. No quotes or labels are necessary." +
					"There should only be one subject in the title. ",
			},
			{
				role: "user",
				content: "Messages Start:\n" + history + "\nMessages End",
			},
		],
		temperature: 0.1,
		stream: true,
	});

	return new Response(completion.body, {
		headers: {
			"content-type": "text/event-stream",
		},
	});
}
