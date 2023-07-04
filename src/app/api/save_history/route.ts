import { redis } from "@/lib/redis";

export const runtime = "edge";

const USER_ID = process.env.USER_ID;

export async function POST(request: Request) {
	const res = await request.json();
	const { saveData, user }: { saveData: string; user: string } = res;

	if (!user && !USER_ID) {
		return new Response("No user id", {
			status: 400,
		});
	}

	const data: SaveData = await JSON.parse(saveData);

	if (!data || !data.chatHistory || data.chatHistory.length === 0) {
		console.log(data.chatHistory);
		return new Response("No chat history", {
			status: 400,
		});
	}

	const success = await redis.set(user, JSON.stringify(saveData));
	if (!success) {
		return new Response("Error saving chat history", {
			status: 500,
		});
	}

	return new Response("OK", {
		status: 200,
	});
}
