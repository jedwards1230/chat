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
	pluginsEnabled: boolean;
	config: Config;
	botTyping: boolean;
	handleSubmit: (e: React.FormEvent) => void;
	abortController?: AbortController;
}

interface Config {
	defaultModel: Model;
	defaultTemperature: number;
	defaultSystemMessage: string;
}

type ChatAction =
	| {
			type: "INITIALIZE";
			payload: {
				saveData: SaveData;
				userId: string;
			};
	  }
	/* Chat */
	| { type: "SET_BOT_TYPING"; payload?: AbortController }
	| { type: "SET_ACTIVE_THREAD"; payload: ChatThread }
	| { type: "CHANGE_TEMPERATURE"; payload: number }
	| { type: "SET_SYSTEM_MESSAGE"; payload: string }
	| { type: "TOGGLE_PLUGINS"; payload?: boolean }
	| { type: "REMOVE_THREAD"; payload: string }
	| { type: "CHANGE_INPUT"; payload: string }
	| { type: "TOGGLE_PLUGIN"; payload: Tool }
	| { type: "CREATE_THREAD" }
	| { type: "CLEAR_HISTORY" }
	| { type: "CANCEL_EDIT" }
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
	  }
	/* Views */
	| { type: "SET_PLUGINS_EDITOR_OPEN"; payload?: boolean }
	| { type: "SET_CONFIG_EDITOR_OPEN"; payload?: boolean }
	| { type: "SET_AGENT_EDITOR_OPEN"; payload?: boolean }
	| { type: "SET_SIDEBAR_OPEN"; payload?: boolean }
	/* Config */
	| { type: "CHANGE_USER_ID_REQUIRED"; payload: boolean }
	| { type: "CHANGE_USER_ID"; payload: string }
	| { type: "UPDATE_CONFIG"; payload: Config };
