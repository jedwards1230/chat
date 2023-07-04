"use client";

import { v4 as uuidv4 } from "uuid";

const systemMessage = "You are a helpful assistant.";

export function getDefaultThread(): ChatThread {
	return {
		id: uuidv4(),
		title: "New Chat",
		messages: [
			{
				id: uuidv4(),
				role: "system",
				content: systemMessage,
			},
		],
		agentConfig: {
			id: "",
			name: "Chat",
			model: "gpt-4-0613",
			temperature: 0.7,
			systemMessage,
			tools: [],
		},
	};
}

const baseEntry = getDefaultThread();

const initialState: ChatState = {
	threadList: [] as ChatThread[],
	input: "",
	activeThread: baseEntry,
	editId: null,
	config: {
		defaultModel: baseEntry.agentConfig.model,
		defaultTemperature: baseEntry.agentConfig.temperature,
		defaultSystemMessage: baseEntry.agentConfig.systemMessage,
	},
	pluginsEnabled: false,
	sideBarOpen: true,
	agentEditorOpen: false,
	configEditorOpen: false,
	pluginsEditorOpen: false,
	userId: "",
	userIdRequired: false,
	handleSubmit: () => {},
};

export default initialState;
