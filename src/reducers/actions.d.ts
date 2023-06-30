type ConfigAction =
	| { type: "TOGGLE_SIDEBAR"; payload?: boolean }
	| { type: "TOGGLE_AGENT_EDITOR"; payload?: boolean }
	| {
			type: "REMOVE_THREAD";
			payload: string;
	  }
	| {
			type: "UPSERT_MESSAGE";
			payload: {
				threadId: string;
				message: Message;
			};
	  };

type ChatAction =
	| { type: "INITIALIZE"; payload: ChatEntry[] }
	| { type: "CREATE_THREAD"; payload: ChatEntry }
	| {
			type: "REMOVE_THREAD";
			payload: string;
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
