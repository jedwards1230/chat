import { getDefaultThread } from "@/providers/initialChat";
import { upsertMessage } from "@/utils";

const DEBUG = false;

export function chatReducer(state: ChatState, action: ChatAction) {
	switch (action.type) {
		case "TOGGLE_SIDEBAR":
			return {
				...state,
				sideBarOpen: action.payload ?? !state.sideBarOpen,
			};
		case "TOGGLE_AGENT_EDITOR":
			return {
				...state,
				agentEditorOpen: action.payload ?? !state.agentEditorOpen,
			};
		case "TOGGLE_CONFIG_EDITOR":
			return {
				...state,
				configEditorOpen: action.payload ?? !state.configEditorOpen,
			};
		case "INITIALIZE":
			if (DEBUG) console.log("INITIALIZE");
			return {
				...state,
				threadList: action.payload,
				activeThread: getDefaultThread(),
			};
		case "CREATE_THREAD":
			if (DEBUG) console.log("CREATE_THREAD");

			return {
				...state,
				activeThread: getDefaultThread(),
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
						? getDefaultThread()
						: state.activeThread,
			};

		case "CANCEL_EDIT":
			if (DEBUG) console.log("CANCEL_EDIT");
			return {
				...state,
				editId: null,
				input: "",
			};

		case "CHANGE_TEMPERATURE":
			if (DEBUG) console.log("CHANGE_TEMPERATURE");
			const newTemperature = {
				...state.activeThread,
				agentConfig: {
					...state.activeThread.agentConfig,
					temperature: action.payload,
				},
			};
			return {
				...state,
				activeThread: newTemperature,
				threadList: state.threadList.map((thread) =>
					thread.id === state.activeThread.id
						? newTemperature
						: thread
				),
			};

		case "CHANGE_SYSTEM_MESSAGE":
			if (DEBUG) console.log("CHANGE_SYSTEM_MESSAGE");
			const newSystemMessage = {
				...state.activeThread,
				agentConfig: {
					...state.activeThread.agentConfig,
					systemMessage: action.payload,
				},
				messages: [
					{
						...state.activeThread.messages[0],
						content: action.payload,
					},
					...state.activeThread.messages.slice(1),
				],
			};
			return {
				...state,
				activeThread: newSystemMessage,
				threadList: state.threadList.map((thread) =>
					thread.id === state.activeThread.id
						? newSystemMessage
						: thread
				),
			};

		case "REMOVE_MESSAGE":
			if (DEBUG) console.log("REMOVE_MESSAGE");
			console.log(
				state.threadList.map((thread) => {
					return thread.id === action.payload.threadId
						? {
								...thread,
								messages: thread.messages.filter(
									(message) =>
										message.id !== action.payload.messageId
								),
						  }
						: null;
				})
			);
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
				const defaultThread = getDefaultThread();
				const newThread: ChatThread = {
					...defaultThread,
					id: action.payload.threadId,
					agentConfig: {
						...defaultThread.agentConfig,
						temperature: state.activeThread.agentConfig.temperature,
						systemMessage:
							state.activeThread.agentConfig.systemMessage,
					},
					messages: [
						{
							...state.activeThread.messages[0],
							content:
								state.activeThread.agentConfig.systemMessage,
						},
						...defaultThread.messages.splice(1),
						action.payload.message,
					],
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

		case "EDIT_MESSAGE":
			if (DEBUG) console.log("EDIT_MESSAGE");
			const messageToEdit = state.activeThread.messages.find(
				(message) => message.id === action.payload.messageId
			);

			if (!messageToEdit) throw new Error("No message to edit");

			return {
				...state,
				editId: action.payload.messageId,
				input: messageToEdit.content,
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
