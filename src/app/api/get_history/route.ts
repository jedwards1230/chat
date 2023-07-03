import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";

export const runtime = "edge";

const USER_ID = process.env.USER_ID;

export async function POST(request: Request) {
	const res = await request.json();
	const { userId }: { userId: string } = res;

	if (!userId && !USER_ID) {
		return new Response("No user id", {
			status: 400,
		});
	}

	const history: any[] | null | undefined = await redis.get(userId);
	if (!history) {
		return new Response("Error getting chat history", {
			status: 500,
		});
	}

	return NextResponse.json(history, {
		status: 200,
	});
}
