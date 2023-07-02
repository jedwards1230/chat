import { v4 as uuidv4 } from "uuid";

export const baseEntry: ChatThread = {
	id: uuidv4(),
	title: "New Chat",
	messages: [],
	agentConfig: {
		id: "",
		name: "",
		model: "gpt-4-0613",
		temperature: 0.7,
		systemMessage: "You are a helpful assistant.",
	},
};

const initialState: ChatState = {
	threadList: [baseEntry],
	input: "",
	activeThread: baseEntry,
	editId: null,
	handleSubmit: () => {},
};

export default initialState;
