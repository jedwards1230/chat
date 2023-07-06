"use server";

import { auth } from "@clerk/nextjs";
import { redis } from "./lib/redis";

export async function getCloudHistory(): Promise<SaveData | null> {
	const { userId } = auth();
	if (!userId) {
		return null;
	}

	const history: any | null | undefined = await redis.get(userId);
	if (!history) {
		return null;
	}

	return {
		...history,
		chatHistory: history.chatHistory.map((thread: ChatThread) => ({
			...thread,
			created: new Date(thread.created),
			lastModified: new Date(thread.lastModified),
			messages: JSON.parse(thread.messages as any),
		})),
	};
}

export async function saveCloudHistory(saveData: string) {
	const { userId } = auth();
	if (!userId) {
		throw new Error("No user id");
	}

	const data: SaveData = await JSON.parse(saveData);
	if (data.chatHistory.length === 0) return;

	const success = await redis.set(userId, saveData);
	if (!success) {
		throw new Error("Error saving chat history");
	}
}

export async function searchGoogle(
	input: string,
	googleApiKey?: string,
	googleCSEId?: string
) {
	const apiKey = process.env.GOOGLE_API_KEY || googleApiKey;
	const CSEId = process.env.GOOGLE_CSE_ID || googleCSEId;

	if (!apiKey || !CSEId) {
		throw new Error(
			"Missing GOOGLE_API_KEY or GOOGLE_CSE_ID environment variables"
		);
	}

	const url = new URL("https://www.googleapis.com/customsearch/v1");
	url.searchParams.set("key", apiKey);
	url.searchParams.set("cx", CSEId);
	url.searchParams.set("q", input);
	url.searchParams.set("start", "1");

	const res = await fetch(url);

	if (!res.ok) {
		throw new Error(
			`Got ${res.status} error from Google custom search: ${res.statusText}`
		);
	}

	const json = await res.json();

	const results: SearchResult[] =
		json?.items?.map(
			(item: { title?: string; link?: string; snippet?: string }) => ({
				query: input,
				title: item.title,
				url: item.link,
				snippet: item.snippet,
			})
		) ?? [];
	return results;
}
