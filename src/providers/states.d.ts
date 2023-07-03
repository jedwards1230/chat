interface ChatState {
	input: string;
	activeThread: ChatThread;
	threadList: ChatThread[];
	editId: string | null;
	sideBarOpen: boolean;
	agentEditorOpen: boolean;
	configEditorOpen: boolean;
	handleSubmit: (e: React.FormEvent) => void;
}

type ChatAction =
	| { type: "TOGGLE_SIDEBAR"; payload?: boolean }
	| { type: "TOGGLE_AGENT_EDITOR"; payload?: boolean }
	| { type: "TOGGLE_CONFIG_EDITOR"; payload?: boolean }
	| { type: "INITIALIZE"; payload: ChatThread[] }
	| { type: "CREATE_THREAD" }
	| { type: "REMOVE_THREAD"; payload: string }
	| { type: "CHANGE_INPUT"; payload: string }
	| { type: "CHANGE_ACTIVE_THREAD"; payload: ChatThread }
	| { type: "CLEAR_HISTORY" }
	| { type: "CANCEL_EDIT" }
	| { type: "CHANGE_TEMPERATURE"; payload: number }
	| { type: "CHANGE_SYSTEM_MESSAGE"; payload: string }
	| {
			type: "EDIT_MESSAGE";
			payload: {
				threadId: string;
				messageId: string;
			};
	  }
	| {
			type: "REMOVE_MESSAGE";
			payload: {
				threadId: string;
				messageId: string;
			};
	  }
	| {
			type: "UPSERT_MESSAGE";
			payload: {
				threadId: string;
				message: Message;
			};
	  }
	| {
			type: "UPSERT_TITLE";
			payload: {
				threadId: string;
				title: string;
			};
	  }
	| {
			type: "CHANGE_MODEL";
			payload: {
				threadId: string;
				model: Model;
			};
	  };
