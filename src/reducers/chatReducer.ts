export function chatReducer(state: ChatState, action: ChatAction) {
	switch (action.type) {
		case "INITIALIZE":
			return {
				...state,
				threadList: action.payload,
			};
		case "CREATE_THREAD":
			return {
				...state,
				threadList: [...state.threadList, action.payload],
			};

		case "REMOVE_THREAD":
			return {
				...state,
				threadList: state.threadList.filter(
					(thread) => thread.id !== action.payload
				),
			};

		case "UPSERT_MESSAGE":
			return {
				...state,
				threadList: state.threadList.map((thread) => {
					const hasMessage = thread.messages.find(
						(message) => message.id === action.payload.message.id
					);
					return thread.id === action.payload.threadId
						? {
								...thread,
								messages: hasMessage
									? thread.messages.map((message) =>
											message.id ===
											action.payload.message.id
												? action.payload.message
												: message
									  )
									: [
											...thread.messages,
											action.payload.message,
									  ],
						  }
						: thread;
				}),
			};

		case "UPSERT_TITLE":
			return {
				...state,
				threadList: state.threadList.map((thread) =>
					thread.id === action.payload.threadId
						? {
								...thread,
								title: action.payload.title,
						  }
						: thread
				),
			};

		case "CHANGE_MODEL":
			return {
				...state,
				threadList: state.threadList.map((thread) =>
					thread.id === action.payload.threadId
						? {
								...thread,
								agentConfig: {
									...thread.agentConfig,
									model: action.payload.model,
								},
						  }
						: thread
				),
			};

		case "CLEAR_HISTORY":
			return {
				...state,
				threadList: [],
			};

		default:
			return state;
	}
}
