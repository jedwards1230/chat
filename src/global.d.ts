type Model = "gpt-3.5-turbo" | "gpt-3.5-turbo-16k" | "gpt-4" | "gpt-4-0613";

type Role = "system" | "user" | "assistant" | "function";

type Message = {
	id: string;
	content: string;
	role: Role;
	createdAt?: Date;
	name?: Tool;
	function_call?: {
		name?: string;
		arguments?: string;
	};
};

interface SaveData {
	chatHistory: ChatThread[];
	config: Config;
}

interface ShareData {
	thread: ChatThread;
}

interface AgentConfig {
	id: string;
	name: string;
	model: Model;
	temperature: number;
	systemMessage: string;
	topP: number;
	n: number;
	maxTokens: number;
	frequencyPenalty: number;
	presencePenalty: number;
	stop: string[];
	logitBias: { [key: string]: number };
	user: string;
	tools: Tool[];
}

interface ChatThread {
	created: Date;
	lastModified: Date;
	id: string;
	title: string;
	messages: Message[];
	agentConfig: AgentConfig;
}

type Choice = {
	delta: {
		function_call?: {
			arguments?: string;
			name?: string;
		};
		content?: string;
	};
	finish_reason: "function_call" | null;
	index: number;
};

interface StreamData {
	choices: Choice[];
	created: number;
	id: string;
	model: Model;
	object: string;
}

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
