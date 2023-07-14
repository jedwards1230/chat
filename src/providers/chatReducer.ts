import { getDefaultThread } from "@/providers/initialChat";
import { upsertMessage } from "@/utils/client";

const DEBUG = false;

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
	switch (action.type) {
		case "SET_SIDEBAR_OPEN":
			return {
				...state,
				sideBarOpen: action.payload ?? !state.sideBarOpen,
			};
		case "SET_CONFIG_EDITOR_OPEN":
			return {
				...state,
				configEditorOpen: action.payload ?? !state.configEditorOpen,
			};
		case "SET_SHARE_MODAL_OPEN":
			return {
				...state,
				shareModalOpen: action.payload ?? !state.shareModalOpen,
			};
		case "TOGGLE_PLUGIN":
			const tools = state.activeThread.agentConfig.tools;
			const newToolsThread = {
				...state.activeThread,
				lastModified: new Date(),
				agentConfig: {
					...state.activeThread.agentConfig,
					tools: tools.includes(action.payload)
						? tools.filter((tool) => tool !== action.payload)
						: [...tools, action.payload],
				},
			};
			return {
				...state,
				activeThread: newToolsThread,
				threadList: state.threadList.map((thread) =>
					thread.id === state.activeThread.id
						? newToolsThread
						: thread
				),
			};
		case "TOGGLE_PLUGINS":
			return {
				...state,
				pluginsEnabled: action.payload ?? !state.pluginsEnabled,
			};
		case "SET_BOT_TYPING":
			return {
				...state,
				botTyping: action.payload ? true : false,
				abortController: action.payload,
			};
		case "INITIALIZE":
			if (DEBUG) console.log("INITIALIZE");
			return {
				...state,
				config: action.payload.config,
				threadList: action.payload.chatHistory,
				activeThread: getDefaultThread(state.config),
			};
		case "CREATE_THREAD":
			if (DEBUG) console.log("CREATE_THREAD");
			document.title = "Chat";
			state.abortController?.abort();

			return {
				...state,
				abortController: undefined,
				activeThread: getDefaultThread(state.config),
				input: "",
			};
		case "REMOVE_THREAD":
			if (DEBUG) console.log("REMOVE_THREAD");
			if (state.activeThread.id === action.payload) {
				document.title = "Chat";
			}
			return {
				...state,
				threadList: state.threadList.filter(
					(thread) => thread.id !== action.payload
				),
				activeThread:
					state.activeThread.id === action.payload
						? getDefaultThread(state.config)
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
				lastModified: new Date(),
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
		case "SET_SYSTEM_NAME":
			if (DEBUG) console.log("SET_SYSTEM_NAME");
			const newSystemName: ChatThread = {
				...state.activeThread,
				lastModified: new Date(),
				agentConfig: {
					...state.activeThread.agentConfig,
					name: action.payload,
				},
			};
			return {
				...state,
				activeThread: newSystemName,
				threadList: state.threadList.map((thread) =>
					thread.id === state.activeThread.id ? newSystemName : thread
				),
			};
		case "SET_SYSTEM_MESSAGE":
			if (DEBUG) console.log("SET_SYSTEM_MESSAGE");
			const newSystemMessage = {
				...state.activeThread,
				lastModified: new Date(),
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
		case "UPDATE_CONFIG":
			if (DEBUG) console.log("UPDATE_CONFIG");
			return {
				...state,
				config: action.payload,
			};
		case "REMOVE_MESSAGE":
			if (DEBUG) console.log("REMOVE_MESSAGE");
			return {
				...state,
				threadList: state.threadList.map((thread) =>
					thread.id === action.payload.threadId
						? {
								...thread,
								lastModified: new Date(),
								messages: thread.messages.filter(
									(message) =>
										message.id !== action.payload.messageId
								),
						  }
						: thread
				),
				activeThread: {
					...state.activeThread,
					lastModified: new Date(),
					messages: state.activeThread.messages.filter(
						(message) => message.id !== action.payload.messageId
					),
				},
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
				const defaultThread = getDefaultThread(state.config);
				const newThread: ChatThread = {
					...defaultThread,
					id: action.payload.threadId,
					agentConfig: state.activeThread.agentConfig,
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
			try {
				const messageToEdit = state.activeThread.messages.find(
					(message) => message.id === action.payload.messageId
				);

				if (!messageToEdit) throw new Error("No message to edit");

				return {
					...state,
					editId: action.payload.messageId,
					input: messageToEdit.content,
				};
			} catch (e) {
				console.error(e);
				return state;
			}
		case "UPSERT_TITLE":
			if (DEBUG) console.log("UPSERT_TITLE");
			document.title = "Chat | " + action.payload.title;
			return {
				...state,
				threadList: state.threadList.map((thread) =>
					thread.id === action.payload.threadId
						? {
								...thread,
								lastModified: new Date(),
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
								lastModified: new Date(),
								agentConfig: {
									...thread.agentConfig,
									model: action.payload.model,
								},
						  }
						: thread
				),
				activeThread: {
					...state.activeThread,
					lastModified: new Date(),
					agentConfig: {
						...state.activeThread.agentConfig,
						model: action.payload.model,
					},
				},
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
		case "SET_ACTIVE_THREAD":
			if (DEBUG) console.log("SET_ACTIVE_THREAD");
			try {
				const activeThread = state.threadList.find(
					(thread) => thread.id === action.payload.id
				);
				if (!activeThread) throw new Error("No active thread");
				if (state.abortController) state.abortController.abort();
				document.title = "Chat | " + activeThread.title;

				return {
					...state,
					input: "",
					activeThread,
				};
			} catch (error) {
				console.error(error);
				return state;
			}

		default:
			return state;
	}
}
