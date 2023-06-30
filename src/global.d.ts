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

interface ChatEntry {
	id: string;
	title: string;
	messages: Message[];
}

interface State {
	input: string;
	activeThread: ChatEntry;
	threadList: ChatEntry[];
	handleSubmit: (e: React.FormEvent) => void;
	handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	jumpToChatEntry: (id: string) => void;
	createNewThread: () => void;
	removeThread: (id: string) => void;
}
