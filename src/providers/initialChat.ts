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
			name: "",
			model: "gpt-4-0613",
			temperature: 0.7,
			systemMessage,
		},
	};
}

const baseEntry = getDefaultThread();

const initialState: ChatState = {
	threadList: [],
	input: "",
	activeThread: baseEntry,
	editId: null,
	sideBarOpen: true,
	agentEditorOpen: false,
	configEditorOpen: false,
	handleSubmit: () => {},
};

export default initialState;
