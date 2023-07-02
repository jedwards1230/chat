interface ChatState {
	input: string;
	activeThread: ChatThread;
	threadList: ChatThread[];
	editId: string | null;
	handleSubmit: (e: React.FormEvent) => void;
}

interface ConfigState {
	sideBarOpen: boolean;
	agentEditorOpen: boolean;
	configEditorOpen: boolean;
}
