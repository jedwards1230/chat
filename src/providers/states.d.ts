interface ChatState {
	input: string;
	activeThread: ChatEntry;
	threadList: ChatEntry[];
	handleSubmit: (e: React.FormEvent) => void;
}

interface ConfigState {
	sideBarOpen: boolean;
	agentEditorOpen: boolean;
	configEditorOpen: boolean;
}
