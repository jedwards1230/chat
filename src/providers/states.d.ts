interface ChatState {
	input: string;
	activeThread: ChatThread;
	threadList: ChatThread[];
	handleSubmit: (e: React.FormEvent) => void;
}

interface ConfigState {
	sideBarOpen: boolean;
	agentEditorOpen: boolean;
	configEditorOpen: boolean;
}
