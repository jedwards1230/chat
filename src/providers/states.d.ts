interface ChatState {
	input: string;
	// todo: proper auth
	/** User Id for chat history */
	userId: string;
	userIdRequired: boolean;
	activeThread: ChatThread;
	threadList: ChatThread[];
	editId: string | null;
	sideBarOpen: boolean;
	agentEditorOpen: boolean;
	configEditorOpen: boolean;
	pluginsEditorOpen: boolean;
	handleSubmit: (e: React.FormEvent) => void;
}

type ChatAction =
	| { type: "CHANGE_ACTIVE_THREAD"; payload: ChatThread }
	| { type: "CHANGE_USER_ID_REQUIRED"; payload: boolean }
	| { type: "TOGGLE_PLUGINS_EDITOR"; payload?: boolean }
	| { type: "TOGGLE_CONFIG_EDITOR"; payload?: boolean }
	| { type: "CHANGE_SYSTEM_MESSAGE"; payload: string }
	| { type: "TOGGLE_AGENT_EDITOR"; payload?: boolean }
	| { type: "CHANGE_TEMPERATURE"; payload: number }
	| { type: "CHANGE_USER_ID"; payload: string }
	| { type: "TOGGLE_SIDEBAR"; payload?: boolean }
	| { type: "REMOVE_THREAD"; payload: string }
	| { type: "CHANGE_INPUT"; payload: string }
	| { type: "TOGGLE_PLUGIN"; payload: Tool }
	| { type: "CREATE_THREAD" }
	| { type: "CLEAR_HISTORY" }
	| { type: "CANCEL_EDIT" }
	| {
			type: "INITIALIZE";
			payload: {
				chatHistory: ChatThread[];
				userId: string;
			};
	  }
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
