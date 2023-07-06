import { redis } from "@/lib/redis";
import { auth } from "@clerk/nextjs";

export const runtime = "edge";

export async function POST(request: Request) {
	const res = await request.json();
	const { saveData }: { saveData: string } = res;
	const { userId } = auth();

	if (!userId) {
		return new Response("No user id", {
			status: 400,
		});
	}

	if (!saveData) {
		return new Response("No save data", {
			status: 400,
		});
	}

	const data: SaveData = await JSON.parse(saveData);

	if (!data || !data.chatHistory || data.chatHistory.length === 0) {
		return new Response("No chat history", {
			status: 400,
		});
	}

	const success = await redis.set(userId, saveData);
	if (!success) {
		return new Response("Error saving chat history", {
			status: 500,
		});
	}

	return new Response("OK", {
		status: 200,
	});
}
