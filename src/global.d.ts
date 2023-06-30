type Message = {
	id: string;
	createdAt?: Date | undefined;
	content: string;
	role: "system" | "user" | "assistant" | "function";
	name?: string | undefined;
	function_call?:
		| string
		| ChatCompletionRequestMessageFunctionCall
		| undefined;
};

type Model = "gpt-3.5-turbo" | "gpt-3.5-turbo-16k" | "gpt-4";

interface AgentConfig {
	id: string;
	name: string;
	model: Model;
}

interface ChatEntry {
	id: string;
	title: string;
	messages: Message[];
	agentConfig: AgentConfig;
}

interface ChatState {
	input: string;
	activeThread: ChatEntry;
	threadList: ChatEntry[];
	handleSubmit: (e: React.FormEvent) => void;
	handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	jumpToChatEntry: (id: string) => void;
	createNewThread: () => void;
	removeThread: (id: string) => void;
}

interface ConfigState {
	sideBarOpen: boolean;
	agentEditorOpen: boolean;
	configEditorOpen: boolean;
}
