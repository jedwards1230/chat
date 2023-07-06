"use client";

import resolveConfig from "tailwindcss/resolveConfig";

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

export function serializeSaveData(saveData: SaveData): string {
	return JSON.stringify({
		config: saveData.config,
		chatHistory: saveData.chatHistory.map((thread) => ({
			...thread,
			messages: JSON.stringify(thread.messages),
		})),
	});
}

export async function getChatHistory(): Promise<SaveData | null> {
	try {
		const res = await fetch("/api/get_history", {
			method: "POST",
		});
		if (res.ok) {
			const data = await res.json();
			return {
				...data,
				chatHistory: data.chatHistory.map((thread: ChatThread) => ({
					...thread,
					created: new Date(thread.created),
					lastModified: new Date(thread.lastModified),
					messages: JSON.parse(thread.messages as any),
				})),
			};
		}
	} catch (e) {
		console.error(e);
	}

	if (typeof window !== "undefined") {
		const storedThreads = localStorage.getItem("chatHistory");
		if (storedThreads) {
			const saveData: SaveData = JSON.parse(storedThreads);
			return saveData;
		}
	}

	return null;
}

export function isMobile() {
	if (typeof window === "undefined") return false;
	const screens = fullConfig.theme?.screens as Record<string, string>;
	if (window.innerWidth < parseInt(screens.sm)) return true;
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
				return JSON.parse(jsonStr);
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
