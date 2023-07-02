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

export const getChatHistory = () => {
	if (typeof window !== "undefined") {
		const storedThreads = localStorage.getItem("chatHistory");
		if (storedThreads) {
			const chatHistory: ChatEntry[] = JSON.parse(storedThreads);
			return chatHistory;
		}
	}

	return null;
};

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

export async function callTool(tool: string, input: string) {
	switch (tool) {
		case "calculator":
			return new Calculator().call(input);
		case "search":
			return await new Search().call(input);
		default:
			return "";
	}
}

export function parseStreamData(chunk: string) {
	try {
		return chunk
			.split("\n")
			.filter((c) => c.length > 0)
			.map((c) => {
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
