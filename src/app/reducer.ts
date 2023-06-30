type Action =
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
	  };

export function reducer(state: State, action: Action) {
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

		default:
			return state;
	}
}
