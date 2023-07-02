import { v4 as uuidv4 } from "uuid";

const initialState: ChatState = {
	threadList: [],
	input: "",
	activeThread: {
		id: uuidv4(),
		title: "New Chat",
		messages: [],
		agentConfig: {
			id: "",
			name: "",
			model: "gpt-4-0613",
		},
	},
	activeThreadId: "",
	handleSubmit: () => {},
};

export default initialState;
