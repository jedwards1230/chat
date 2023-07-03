import { redis } from "@/lib/redis";

export const runtime = "edge";

const USER_ID = process.env.USER_ID;

export async function POST(request: Request) {
	const res = await request.json();
	const { chatHistory, user }: { chatHistory: ChatThread[]; user: string } =
		res;

	if (!user && !USER_ID) {
		return new Response("No user id", {
			status: 400,
		});
	}

	if (!chatHistory) {
		return new Response("No chat history", {
			status: 400,
		});
	}

	const success = await redis.set(user, JSON.stringify({ chatHistory }));
	if (!success) {
		return new Response("Error saving chat history", {
			status: 500,
		});
	}

	return new Response("OK", {
		status: 200,
	});
}
