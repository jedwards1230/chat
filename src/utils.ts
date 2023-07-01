"use client";

import resolveConfig from "tailwindcss/resolveConfig";

import tailwindConfig from "../tailwind.config.js";
import { Calculator } from "./tools/calculator";

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

export function callTool(tool: string, input: string) {
	if (tool === "calculator") {
		return new Calculator().call(input);
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
