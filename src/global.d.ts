type Role = "system" | "user" | "assistant" | "function";

type Message = {
	id?: string;
	content: string;
	role: Role;
	createdAt?: Date | undefined;
	name?: string | undefined;
	function_call?: string | undefined;
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
	activeThreadId: string;
	threadList: ChatEntry[];
	handleSubmit: (e: React.FormEvent) => void;
	createNewThread: () => void;
	removeThread: (id: string) => void;
}

interface ConfigState {
	sideBarOpen: boolean;
	agentEditorOpen: boolean;
	configEditorOpen: boolean;
}
