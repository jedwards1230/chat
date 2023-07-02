type Role = "system" | "user" | "assistant" | "function";

type Message = {
	id: string;
	content: string;
	role: Role;
	createdAt?: Date | undefined;
	name?: string | undefined;
	function_call?:
		| {
				name?: string;
				arguments?: string;
		  }
		| undefined;
};

type Model = "gpt-3.5-turbo" | "gpt-3.5-turbo-16k" | "gpt-4" | "gpt-4-0613";

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

type CustomTool = {
	name: string;
	description: string;
	parameters: {
		type: string;
		properties: {
			[key: string]: {
				type: string;
				description: string;
			};
		};
		required: string[];
	};
};

interface SearchResult {
	/** Query used with Search Engine API */
	query: string;
	url: string;
	snippet: string;
	title: string;
	/** AI-generated summary */
	content?: string;
	error?: string;
	/** Finished analysis for primary chat */
	reviewed?: boolean;
	/** Fime taken to store text embeddings  */
	timeToComplete?: number;
}

interface ChatState {
	input: string;
	activeThread: ChatEntry;
	activeThreadId: string;
	threadList: ChatEntry[];
	handleSubmit: (e: React.FormEvent) => void;
}

interface ConfigState {
	sideBarOpen: boolean;
	agentEditorOpen: boolean;
	configEditorOpen: boolean;
}
