"use client";

import resolveConfig from "tailwindcss/resolveConfig";

import { Calculator } from "./tools/calculator";
import { Search } from "./tools/search";

import tailwindConfig from "../tailwind.config.js";

export const fullConfig = resolveConfig(tailwindConfig);

export async function readStream(
	stream: ReadableStream,
	chunkCallback: (token: string) => void
) {
	const reader = stream.getReader();
	let accumulatedResponse = "";

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		if (value) {
			const decoded = new TextDecoder().decode(value);
			accumulatedResponse += decoded;
			chunkCallback(accumulatedResponse);
		}
	}

	return accumulatedResponse;
}

export async function getChatHistory(id: string): Promise<{
	saveData: SaveData;
	userId: string;
} | null> {
	let userId = id;
	if (!userId) {
		if (typeof window !== "undefined") {
			userId = localStorage.getItem("userId") || "";
		}
	}

	try {
		const res = await fetch("/api/get_history", {
			method: "POST",
			body: JSON.stringify({ userId }),
		});
		if (res.ok) {
			const data = await res.json();
			const saveData: SaveData = JSON.parse(data);
			return {
				saveData: {
					...saveData,
					chatHistory: saveData.chatHistory.map((thread) => ({
						...thread,
						messages: JSON.parse(thread.messages as any),
					})),
				},
				userId,
			};
		}
	} catch (e) {
		//console.error(e);
	}

	if (typeof window !== "undefined") {
		const storedThreads = localStorage.getItem("chatHistory");
		if (storedThreads) {
			const saveData: SaveData = JSON.parse(storedThreads);
			return {
				saveData,
				userId,
			};
		}
	}

	return null;
}

export function isMobile() {
	if (typeof window === "undefined") return false;
	const screens = fullConfig.theme?.screens as Record<string, string>;
	if (window.innerWidth < parseInt(screens.sm)) return true;
}

export async function searchGoogle(
	input: string,
	googleApiKey?: string,
	googleCSEId?: string
) {
	const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || googleApiKey;
	const CSEId = process.env.NEXT_PUBLIC_GOOGLE_CSE_ID || googleCSEId;

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

export async function callTool(tool: Tool, input: string) {
	switch (tool) {
		case "calculator":
			return new Calculator().call(input);
		case "search":
			return await new Search().call(input);
		default:
			return "";
	}
}

export function parseStreamData(chunk: string): StreamData[] {
	try {
		return chunk
			.split("\n")
			.filter((c) => c.length > 0)
			.map((c) => {
				// TODO: ensure this only replaces the first instance
				const jsonStr = c.replace("data: ", "");
				if (jsonStr === "[DONE]") return;
				return JSON.parse(jsonStr);
			});
	} catch (e) {
		console.error(e);
		console.log(chunk);
		return [];
	}
}

export function upsertMessage(thread: ChatThread, newMessage: Message) {
	// check if message already exists
	const hasMessage = thread.messages.find(
		(message) => message.id === newMessage.id
	);

	// if message exists, update it
	// otherwise, add it to the list
	const messages = hasMessage
		? thread.messages.map((message) =>
				message.id === newMessage.id ? newMessage : message
		  )
		: [...thread.messages, newMessage];

	return {
		...thread,
		messages,
	};
}
