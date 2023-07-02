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
			model: "gpt-3.5-turbo-16k",
		},
	},
	activeThreadId: "",
	handleSubmit: () => {},
};

export default initialState;
