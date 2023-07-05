"use client";

import { v4 as uuidv4 } from "uuid";

const systemMessage = "You are a helpful assistant.";

const defaultConfig: Config = {
	defaultModel: "gpt-4-0613",
	defaultTemperature: 0.7,
	defaultSystemMessage: systemMessage,
};

export function getDefaultThread(config: Config): ChatThread {
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
			model: config.defaultModel,
			temperature: config.defaultTemperature,
			systemMessage: config.defaultSystemMessage,
			tools: ["search"],
		},
	};
}

const baseEntry = getDefaultThread(defaultConfig);

const initialState: ChatState = {
	threadList: [] as ChatThread[],
	input: "",
	activeThread: baseEntry,
	editId: null,
	botTyping: false,
	config: {
		defaultModel: baseEntry.agentConfig.model,
		defaultTemperature: baseEntry.agentConfig.temperature,
		defaultSystemMessage: baseEntry.agentConfig.systemMessage,
	},
	pluginsEnabled: true,
	sideBarOpen: true,
	agentEditorOpen: false,
	configEditorOpen: false,
	pluginsEditorOpen: false,
	userId: "",
	userIdRequired: false,
	handleSubmit: () => {},
};

export default initialState;
