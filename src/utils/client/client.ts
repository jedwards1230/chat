"use client";

import resolveConfig from "tailwindcss/resolveConfig";

import tailwindConfig from "../../../tailwind.config.js";

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

export function isMobile(size?: "sm" | "md" | "lg" | "xl") {
	if (typeof window === "undefined") return false;
	const screens = fullConfig.theme?.screens as Record<string, string>;
	switch (size) {
		case "sm":
			return window.innerWidth < parseInt(screens.sm);
		case "md":
			return window.innerWidth < parseInt(screens.md);
		case "lg":
			return window.innerWidth < parseInt(screens.lg);
		case "xl":
			return window.innerWidth < parseInt(screens.xl);
		default:
			return window.innerWidth < parseInt(screens.sm);
	}
}

export async function callTool(tool: Tool, input: string) {
	const res = await fetch("/api/use_tool", {
		method: "POST",
		body: JSON.stringify({ tool, input }),
	});

	if (!res.ok) {
		throw new Error(
			`Got ${res.status} error from tool endpoint: ${res.statusText}`
		);
	}

	const json = await res.json();

	return json;
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
				try {
					return JSON.parse(jsonStr);
				} catch {
					return;
				}
			});
	} catch (e) {
		console.error(e);
		console.log(chunk);
		return [];
	}
}

export function upsertMessage(
	thread: ChatThread,
	newMessage: Message
): ChatThread {
	let foundMessage = false;
	const messages = thread.messages.map((message) => {
		if (message.id === newMessage.id) {
			foundMessage = true;
			return newMessage;
		}
		return message;
	});
	if (!foundMessage) messages.push(newMessage);

	return {
		...thread,
		lastModified: new Date(),
		messages,
	};
}
