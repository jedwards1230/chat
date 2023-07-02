import { v4 as uuidv4 } from "uuid";

const baseEntry: ChatEntry = {
	id: uuidv4(),
	title: "New Chat",
	messages: [],
	agentConfig: {
		id: "",
		name: "",
		model: "gpt-4-0613",
	},
};

const initialState: ChatState = {
	threadList: [baseEntry],
	input: "",
	activeThread: baseEntry,
	handleSubmit: () => {},
};

export default initialState;
