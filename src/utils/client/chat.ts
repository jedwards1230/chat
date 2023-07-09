"use client";

import { v4 as uuidv4 } from "uuid";
import {
	readStream,
	callTool,
	parseStreamData,
	isMobile as iM,
} from "@/utils/client/client";
import { Dispatch } from "react";

const MAX_LOOPS = 10;

export function createUserMsg(
	content: string,
	editId?: string | null
): Message {
	return {
		id: editId ? editId : uuidv4(),
		role: "user",
		content,
	};
}

export function dispatchUserMsg(
	userMsg: Message,
	dispatch: Dispatch<ChatAction>,
	state: ChatState
) {
	dispatch({ type: "CHANGE_INPUT", payload: "" });
	dispatch({
		type: "UPSERT_MESSAGE",
		payload: {
			threadId: state.activeThread.id,
			message: userMsg,
		},
	});
}

export async function fetchTitle(
	state: ChatState,
	dispatch: Dispatch<ChatAction>
) {
	const l = state.activeThread.messages.length;
	if (l < 2 || l > 10) return;

	const history = state.activeThread.messages.map(
		(msg) => msg.role + ": " + msg.content
	);
	history.push("user: " + state.input);

	const res = await fetch("/api/get_title", {
		method: "POST",
		body: JSON.stringify({
			history: history.join("\n"),
		}),
	});
	if (!res.body) {
		throw new Error("No response body from /api/get_title");
	}

	const reduceStreamData = (acc: string, curr: StreamData) => {
		if (!curr || !curr.choices) return acc;
		const res = curr.choices[0];
		if (res.finish_reason) {
			return acc;
		}
		if (res.delta.function_call) {
			throw new Error("Function call in get_title");
		}
		return acc + res.delta.content;
	};

	const streamCallback = (chunk: string) => {
		const chunks = parseStreamData(chunk);
		const accumulatedResponse = chunks.reduce(reduceStreamData, "");

		dispatch({
			type: "UPSERT_TITLE",
			payload: {
				threadId: state.activeThread.id,
				title: accumulatedResponse,
			},
		});
	};

	await readStream(res.body, streamCallback);
}

export const getChat = async (
	msgHistory: Message[],
	controller: AbortController,
	loops: number = 0,
	state: ChatState,
	dispatch: Dispatch<ChatAction>
) => {
	try {
		if (loops > MAX_LOOPS) {
			throw new Error("Too many loops");
		}
		const signal = controller.signal;
		dispatch({ type: "SET_BOT_TYPING", payload: controller });

		const response = await fetch("/api/chat", {
			method: "POST",
			signal,
			body: JSON.stringify({
				modelName: state.activeThread.agentConfig.model,
				temperature: state.activeThread.agentConfig.temperature,
				tools: state.pluginsEnabled
					? state.activeThread.agentConfig.tools
					: [],
				msgHistory: msgHistory.map((msg) => ({
					content: msg.content,
					role: msg.role,
					name: msg.name,
					function_call: msg.function_call,
				})),
			}),
		});

		if (!response.body) {
			throw new Error("No response body from /api/chat");
		}

		const assistantId = uuidv4();
		let tool: Tool | null = null;
		let toolInput: string = "";
		let accumulatedResponse = "";
		let finishReason: string | null = null;

		const reduceStreamData = (acc: string, curr: StreamData) => {
			if (!curr) return acc;
			const res = curr.choices[0];
			if (res.finish_reason) {
				finishReason = res.finish_reason;
				return acc;
			}
			if (res.delta.function_call) {
				if (res.delta.function_call.name) {
					tool = res.delta.function_call.name as Tool;
				}
				if (res.delta.function_call.arguments) {
					toolInput += res.delta.function_call.arguments;
				}
				return acc;
			}
			return acc + res.delta.content;
		};

		const streamCallback = (chunk: string) => {
			toolInput = "";

			const chunks = parseStreamData(chunk);
			accumulatedResponse = chunks.reduce(reduceStreamData, "");

			if (!tool) {
				const assistantMsg: Message = {
					id: assistantId,
					content: accumulatedResponse,
					role: "assistant",
				};

				dispatch({
					type: "UPSERT_MESSAGE",
					payload: {
						threadId: state.activeThread.id,
						message: assistantMsg,
					},
				});
			}
		};

		await readStream(response.body, streamCallback);

		dispatch({ type: "SET_BOT_TYPING" });

		if (tool) {
			let input = "";
			try {
				const cleaned = JSON.parse(toolInput);
				input = cleaned.input;
			} catch (err) {
				input = toolInput;
			}
			const assistantMsg: Message = {
				id: uuidv4(),
				content: input,
				role: "assistant",
				name: tool,
				function_call: {
					name: tool,
					arguments: input,
				},
			};
			msgHistory.push(assistantMsg);

			dispatch({
				type: "UPSERT_MESSAGE",
				payload: {
					threadId: state.activeThread.id,
					message: assistantMsg,
				},
			});

			const res = await callTool(tool, input);
			if (!res) {
				throw new Error("Tool failure");
			}

			const functionMsg: Message = {
				id: uuidv4(),
				content: res,
				role: "function",
				name: tool,
			};

			msgHistory.push(functionMsg);

			dispatch({
				type: "UPSERT_MESSAGE",
				payload: {
					threadId: state.activeThread.id,
					message: functionMsg,
				},
			});

			getChat(msgHistory, controller, loops + 1, state, dispatch);
		}
	} catch (error: any) {
		if (error.name === "AbortError") {
			console.log("Fetch aborted");
		} else {
			console.error("Error:", error);
		}
		dispatch({ type: "SET_BOT_TYPING" });
	}
};

export const handleSubmit = (
	e: React.FormEvent,
	state: ChatState,
	dispatch: Dispatch<ChatAction>
) => {
	e.preventDefault();
	if (state.input.length > 0) {
		const userMsg: Message = createUserMsg(state.input, state.editId);
		if (state.editId) {
			dispatch({ type: "CANCEL_EDIT" });
		}
		dispatchUserMsg(userMsg, dispatch, state);

		const msgHistory = state.activeThread.messages;
		if (state.editId) {
			const editIndex = msgHistory.findIndex(
				(msg) => msg.id === state.editId
			);
			msgHistory[editIndex] = userMsg;
		} else {
			msgHistory.push(userMsg);
		}

		const controller = new AbortController();

		getChat(msgHistory, controller, 0, state, dispatch);
		fetchTitle(state, dispatch);
	}
};

export const saveHistory = async (saveData: string) => {
	// implementation
};

export const handleResize = () => {
	// implementation
};
