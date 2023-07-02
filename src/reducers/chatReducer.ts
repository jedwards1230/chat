import { v4 as uuidv4 } from "uuid";

import initialState from "@/providers/initialChat";

const baseEntry = initialState.activeThread;

export function chatReducer(state: ChatState, action: ChatAction) {
	switch (action.type) {
		case "INITIALIZE":
			return {
				...state,
				threadList: action.payload,
			};
		case "CREATE_THREAD":
			const newId = uuidv4();
			const newEntry: ChatEntry = {
				...baseEntry,
				id: newId,
			};
			return {
				...state,
				threadList: [...state.threadList, newEntry],
				activeThread: newEntry,
				activeThreadId: newEntry.id,
				input: "",
			};

		case "REMOVE_THREAD":
			return {
				...state,
				threadList: state.threadList.filter(
					(thread) => thread.id !== action.payload
				),
			};

		case "REMOVE_MESSAGE":
			return {
				...state,
				threadList: state.threadList.map((thread) => {
					return thread.id === action.payload.threadId
						? {
								...thread,
								messages: thread.messages.filter(
									(message) =>
										message.id !== action.payload.messageId
								),
						  }
						: thread;
				}),
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

		case "CHANGE_INPUT":
			return {
				...state,
				input: action.payload,
			};

		case "CHANGE_ACTIVE_THREAD":
			return {
				...state,
				input: "",
				activeThreadId: action.payload,
				activeThread: state.threadList.find(
					(thread) => thread.id === action.payload
				) as ChatEntry,
			};

		default:
			return state;
	}
}
