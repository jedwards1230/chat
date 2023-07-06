import { redis } from "@/lib/redis";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(request: Request) {
	const { userId } = auth();

	if (!userId) {
		return new Response("No user id", {
			status: 400,
		});
	}

	const history: any[] | null | undefined = await redis.get(userId);

	return NextResponse.json(history, {
		status: 200,
	});
}
