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
		case "TOGGLE_PLUGINS_EDITOR":
			return {
				...state,
				pluginsEditorOpen: action.payload ?? !state.pluginsEditorOpen,
			};
		case "TOGGLE_PLUGIN":
			const tools = state.activeThread.agentConfig.tools;
			const newToolsThread = {
				...state.activeThread,
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
		case "TOGGLE_BOT_TYPING":
			return {
				...state,
				botTyping: action.payload ? true : false,
				abortController: action.payload,
			};
		case "INITIALIZE":
			if (DEBUG) console.log("INITIALIZE");
			return {
				...state,
				config: action.payload.saveData.config,
				threadList: action.payload.saveData.chatHistory,
				userId: action.payload.userId,
				activeThread: getDefaultThread(state.config),
			};
		case "CREATE_THREAD":
			if (DEBUG) console.log("CREATE_THREAD");

			return {
				...state,
				activeThread: getDefaultThread(state.config),
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

		case "SET_SYSTEM_MESSAGE":
			if (DEBUG) console.log("SET_SYSTEM_MESSAGE");
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

		case "CHANGE_USER_ID":
			if (DEBUG) console.log("CHANGE_USER_ID");
			if (window !== undefined) {
				window.localStorage.setItem("userId", action.payload);
			}
			return {
				...state,
				userId: action.payload,
			};

		case "UPDATE_CONFIG":
			if (DEBUG) console.log("UPDATE_CONFIG");
			return {
				...state,
				config: action.payload,
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
				activeThread: {
					...state.activeThread,
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
			const activeThread = state.threadList.find(
				(thread) => thread.id === action.payload.id
			);
			if (!activeThread) throw new Error("No active thread");
			if (state.abortController) state.abortController.abort();

			return {
				...state,
				input: "",
				activeThread,
			};

		default:
			return state;
	}
}
