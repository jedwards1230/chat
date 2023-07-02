import { v4 as uuidv4 } from "uuid";

import { baseEntry } from "@/providers/initialChat";
import { upsertMessage } from "@/utils";

const DEBUG = false;

export function chatReducer(state: ChatState, action: ChatAction) {
	switch (action.type) {
		case "INITIALIZE":
			if (DEBUG) console.log("INITIALIZE");
			return {
				...state,
				threadList: action.payload,
				activeThread: baseEntry,
			};
		case "CREATE_THREAD":
			if (DEBUG) console.log("CREATE_THREAD");
			const newEntry: ChatThread = {
				...baseEntry,
				messages: [],
				id: uuidv4(),
			};

			return {
				...state,
				activeThread: newEntry,
				input: "",
			};

		case "REMOVE_THREAD":
			if (DEBUG) console.log("REMOVE_THREAD");
			return {
				...state,
				threadList: state.threadList.filter(
					(thread) => thread.id !== action.payload
				),
				activeThread:
					state.activeThread.id === action.payload
						? baseEntry
						: state.activeThread,
			};

		case "REMOVE_MESSAGE":
			if (DEBUG) console.log("REMOVE_MESSAGE");
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
			if (DEBUG) console.log("UPSERT_MESSAGE");

			// update the active thread
			const threadList = state.threadList.map((thread) =>
				thread.id !== action.payload.threadId
					? thread
					: upsertMessage(thread, action.payload.message)
			);

			const getNewActiveThread = () => {
				const newThread: ChatThread = {
					...baseEntry,
					id: action.payload.threadId,
					messages: [action.payload.message],
				};
				threadList.push(newThread);
				return {
					...state,
					threadList: threadList,
					activeThread: newThread,
				};
			};

			const newActiveThread = threadList.find(
				(thread) => thread.id === action.payload.threadId
			);

			if (!newActiveThread) {
				return getNewActiveThread();
			}

			return {
				...state,
				threadList: threadList,
				activeThread: newActiveThread,
			};

		case "UPSERT_TITLE":
			if (DEBUG) console.log("UPSERT_TITLE");
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
			if (DEBUG) console.log("CHANGE_MODEL");
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
			if (DEBUG) console.log("CLEAR_HISTORY");
			return {
				...state,
				threadList: [],
			};

		case "CHANGE_INPUT":
			if (DEBUG) console.log("CHANGE_INPUT");
			return {
				...state,
				input: action.payload,
			};

		case "CHANGE_ACTIVE_THREAD":
			if (DEBUG) console.log("CHANGE_ACTIVE_THREAD");
			const activeThread = state.threadList.find(
				(thread) => thread.id === action.payload.id
			);
			if (!activeThread) throw new Error("No active thread");

			return {
				...state,
				input: "",
				activeThread,
			};

		default:
			return state;
	}
}
