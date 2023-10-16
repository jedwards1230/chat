'use client';

import { Dispatch, SetStateAction, FormEvent } from 'react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import { getDefaultThread, resetDefaultThread } from './initialChat';
import { getChat } from '@/utils/client';
import { deleteMessageById, upsertCharacter } from '@/utils/server/supabase';
import { sortThreadlist } from '@/utils';
import { createMessage, getTitle, getToolData } from '@/utils/client/chat';
import { baseCommands } from '@/tools/commands';
import ChatManager from '@/lib/ChatManager';
import { defaultAgentConfig } from './characters';

type ChatDispatch = Dispatch<SetStateAction<ChatState>>;

/** Find initial thread */
export function getInitialActiveThread(
    savedConfig: AgentConfig,
    activeId: string | null | undefined,
    threadList: ChatThread[],
): number | null {
    for (let i = 0; i < threadList.length; i++) {
        if (threadList[i].id === activeId) {
            return i;
        }
    }

    const initialThread: ChatThread = {
        ...getDefaultThread(defaultAgentConfig),
        ...(savedConfig && { agentConfig: savedConfig }),
        lastModified: new Date(),
    };

    return null;
}

/** Upsert Message into ChatThread */
function upsertMessageState(
    prevState: ChatState,
    newMessage: Message,
    threadId?: string,
): ChatState {
    const activeIdx = threadId
        ? prevState.threads.findIndex((thread) => thread.id === threadId)
        : prevState.currentThreadIdx;

    if (activeIdx === null) return prevState;
    const active = prevState.threads[activeIdx];

    const { mapping: newMapping, currentNode: newCurrentNode } =
        ChatManager.upsertMessage(
            newMessage,
            active.mapping,
            active.currentNode,
        );

    const newThread: ChatThread = {
        ...active,
        mapping: newMapping,
        currentNode: newCurrentNode,
        lastModified: new Date(),
    };

    const threads = [...prevState.threads];
    threads[activeIdx] = newThread;

    return {
        ...prevState,
        threads,
    };
}

/** Upsert Title into ChatThread */
export function upsertTitleState(
    prevState: ChatState,
    title: string,
): ChatState {
    if (prevState.currentThreadIdx === null) return prevState;
    const threads = prevState.threads;
    const activeThread = {
        ...threads[prevState.currentThreadIdx],
        lastModified: new Date(),
        title,
    };

    const foundThreadIndex = threads.findIndex(
        (thread) => thread.id === activeThread.id,
    );

    threads[foundThreadIndex] = {
        ...threads[foundThreadIndex],
        lastModified: new Date(),
        title,
    };

    return { ...prevState, threads };
}

/**
 * upsert thread
 * - If isNew, create new thread with default config
 * - If not isNew, add to current thread
 * */
function upsertThreadState(
    prevState: ChatState,
    newMap: MessagesState,
    controller?: AbortController,
): ChatState {
    const newState = {
        ...prevState,
        editId: prevState.editId ? null : prevState.editId,
        abortController: controller ? controller : prevState.abortController,
        input: '',
    };

    const currentThread = prevState.currentThreadIdx;
    const newThread: ChatThread =
        currentThread === null
            ? { ...prevState.defaultThread }
            : {
                  ...prevState.threads[currentThread],
                  mapping: newMap.mapping,
                  currentNode: newMap.currentNode,
                  lastModified: new Date(),
              };

    const threads = prevState.threads.map((thread) =>
        thread.id === newThread.id ? newThread : thread,
    );
    if (currentThread === null) {
        threads.push(newThread);
    }

    const newIndex = threads.findIndex((thread) => thread.id === newThread.id);

    return {
        ...newState,
        threads,
        currentThreadIdx: newIndex !== -1 ? newIndex : null,
        ...(currentThread === null && {
            defaultThread: resetDefaultThread(),
        }),
    };
}

const getActiveThread = (state: ChatState): ChatThread =>
    state.currentThreadIdx === null
        ? state.defaultThread
        : state.threads[state.currentThreadIdx];

export function createSubmitHandler(
    plausible: PlausibleHook,
    state: ChatState,
    setState: ChatDispatch,
    router: AppRouterInstance,
    openKeyDialog: (open: boolean | AppSettingsSection) => void,
    userId?: string | null,
) {
    const getToolInput = (input: string): ToolInput | undefined => {
        const parts = input.split(' ');
        const command = parts[0] as Command;
        const query = parts.slice(1).join(' ');

        if (command in baseCommands) {
            return {
                name: baseCommands[command],
                args: query,
            };
        }
    };

    const upsertThread = (newMap: MessagesState, controller: AbortController) =>
        setState((p) => upsertThreadState(p, newMap, controller));

    const upsertMessage = (newMessage: Message, threadId?: string) =>
        setState((p) => upsertMessageState(p, newMessage, threadId));

    const upsertTitle = (title: string) => {
        document.title = 'Chat | ' + title;
        setState((p) => upsertTitleState(p, title));
    };

    const getNewMapping = (
        activeThread: ChatThread,
        editId?: string | null,
    ): { newMessage: Message; newMap: MessagesState } => {
        if (editId) {
            const editMessage = activeThread.mapping[editId].message;
            if (editMessage) {
                const newMessage = {
                    ...editMessage,
                    content: state.input,
                };
                const newMap = ChatManager.editMessageAndFork(
                    editId,
                    newMessage,
                    activeThread.mapping,
                );

                return {
                    newMessage: editMessage,
                    newMap,
                };
            }
        }
        const userMsg = createMessage({
            role: 'user',
            content: state.input,
        });

        const newMap = ChatManager.createMessage(
            userMsg,
            activeThread.mapping,
            activeThread.currentNode,
        );

        return {
            newMessage: userMsg,
            newMap,
        };
    };

    return async (e: FormEvent) => {
        e.preventDefault();
        if (state.input.trim() === '') return;
        if (!state.openAiApiKey && !userId) {
            return openKeyDialog('Credentials');
        }

        const activeThread = getActiveThread(state);
        const controller = new AbortController();

        // create new mapping and ordered list of messages
        const { newMessage, newMap } = getNewMapping(
            activeThread,
            state.editId,
        );
        const msgHistory = ChatManager.prepareMessageHistory(
            newMap.currentNode,
            newMap.mapping,
        );

        upsertThread(newMap, controller);
        upsertMessage(newMessage);

        router.replace('/?c=' + activeThread.id);
        plausible('Submitted Message', {
            props: {
                threadId: activeThread.id,
                usedCloudKey: !!state.openAiApiKey,
            },
        });

        const toolInput = getToolInput(state.input);

        const opts = {
            activeThread,
            msgHistory,
            upsertMessage,
            controller,
            state,
            setState,
            loops: 0,
            userId,
        };

        const getRes = toolInput
            ? getToolData({ ...opts, toolInput })
            : getChat(opts);
        getRes.then(() =>
            getTitle(activeThread, upsertTitle, userId, state.openAiApiKey),
        );
    };
}

// take the current message history and submit a chat request
// basically the same as createSubmitHandler but without the form event, router, plausible
export function regenerateChatHandler(
    setState: ChatDispatch,
    state: ChatState,
    userId?: string | null,
) {
    const upsertMessage = (newMessage: Message, threadId?: string) =>
        setState((prevState) =>
            upsertMessageState(prevState, newMessage, threadId),
        );

    return (messageId?: string) => {
        if (!state.openAiApiKey && !userId) {
            return;
        }

        const activeThread = getActiveThread(state);
        const controller = new AbortController();
        const newMap = ChatManager.regenerate(
            activeThread.currentNode,
            activeThread.mapping,
            messageId,
        );

        setState((prevState) =>
            upsertThreadState(prevState, newMap, controller),
        );

        const msgHistory = ChatManager.prepareMessageHistory(
            newMap.currentNode,
            newMap.mapping,
        );

        const opts = {
            activeThread,
            msgHistory,
            upsertMessage,
            controller,
            state,
            setState,
            loops: 0,
            userId,
        };

        getChat(opts);
    };
}

export function createThreadHandler(
    state: ChatState,
    setState: ChatDispatch,
    router: AppRouterInstance,
) {
    return () => {
        state.abortController?.abort();
        setState((prevState) => ({
            ...prevState,
            currentThreadIdx: null,
            defaultThread: resetDefaultThread(),
            input: '',
            botTyping: false,
            isNew: true,
            editId: null,
        }));
        router.replace('/');
    };
}

export function togglePluginHandler(setState: ChatDispatch) {
    return (tool: Tool) => {
        setState((prevState) => {
            const activeThread = getActiveThread(prevState);
            const prevTools = activeThread.agentConfig.tools;
            const tools = prevTools?.includes(tool)
                ? prevTools.filter((t) => t !== tool)
                : [...prevTools, tool];

            const newThread: ChatThread = {
                ...activeThread,
                agentConfig: {
                    ...activeThread.agentConfig,
                    tools,
                },
            };
            const threads = prevState.threads
                .map((thread) =>
                    thread.id === newThread.id ? newThread : thread,
                )
                .sort(sortThreadlist);

            return {
                ...prevState,
                threads,
            };
        });
    };
}

export function updateThreadConfigHandler(setState: ChatDispatch) {
    return (configUpdates: Partial<AgentConfig>) => {
        setState((prevState) => {
            const activeThread = getActiveThread(prevState);
            const agentConfig: AgentConfig = {
                ...activeThread.agentConfig,
                ...configUpdates,
            };

            if (agentConfig.model?.api === 'llama')
                agentConfig.toolsEnabled = false;

            const streamResponse =
                agentConfig.model.api === 'llama'
                    ? false
                    : prevState.streamResponse;

            if (prevState.currentThreadIdx !== null) {
                const newThread: ChatThread = {
                    ...prevState.threads[prevState.currentThreadIdx],
                    agentConfig,
                };
                return {
                    ...prevState,
                    threads: prevState.threads.map((thread) =>
                        thread.id === newThread.id ? newThread : thread,
                    ),
                    lastModified: new Date(),
                    streamResponse,
                };
            } else {
                const defaultThread: ChatThread = {
                    ...prevState.defaultThread,
                    agentConfig,
                };

                return {
                    ...prevState,
                    defaultThread,
                    lastModified: new Date(),
                    streamResponse,
                };
            }
        });
    };
}

export function setSystemMessageHandler(setState: ChatDispatch) {
    return (systemMessage: string) => {
        setState((prevState) => {
            const activeThread = getActiveThread(prevState);
            const systemMsg = ChatManager.getSystemMessage(
                activeThread.currentNode,
                activeThread.mapping,
            );

            if (systemMsg) {
                activeThread.mapping = ChatManager.updateMessage(
                    {
                        ...(systemMsg && systemMsg),
                        content: systemMessage,
                    },
                    activeThread.mapping,
                );
            } else {
                const { mapping: newMapping, currentNode: newCurrentNode } =
                    ChatManager.createMessage(
                        {
                            ...createMessage({ role: 'system' }),
                            content: systemMessage,
                        },
                        activeThread.mapping,
                        activeThread.currentNode,
                    );
                activeThread.currentNode = newCurrentNode;
                activeThread.mapping = newMapping;
            }

            const newThread: ChatThread = {
                ...activeThread,
                lastModified: new Date(),
                agentConfig: {
                    ...activeThread.agentConfig,
                    systemMessage,
                },
            };

            return {
                ...prevState,
                lastModified: new Date(),
                threads: prevState.threads.map((thread) =>
                    thread.id === newThread.id ? newThread : thread,
                ),
            };
        });
    };
}

export function editMessageHandler(setState: ChatDispatch) {
    return (id: string) => {
        setState((prevState) => {
            const activeThread = getActiveThread(prevState);
            const msg = activeThread.mapping[id].message;
            if (!msg) {
                throw new Error('Message not found');
            }
            return {
                ...prevState,
                editId: id,
                input: msg.content || '',
                saved: false,
            };
        });
    };
}

export function removeMessageHandler(setState: ChatDispatch) {
    return (id: string) => {
        setState((prevState) => {
            const activeThread = getActiveThread(prevState);
            const newMapping = ChatManager.deleteMessage(
                id,
                activeThread.mapping,
                activeThread.currentNode,
            );
            activeThread.mapping = newMapping.updatedMapping;
            activeThread.currentNode = newMapping.newCurrentNode;
            return {
                ...prevState,
                saved: false,
                threads: prevState.threads.map((thread) =>
                    thread.id === activeThread.id ? activeThread : thread,
                ),
            };
        });
        deleteMessageById(id);
    };
}

export function removeThreadHandler(setState: ChatDispatch) {
    return (id: string) =>
        setState((prevState) => {
            const threads = prevState.threads.filter(
                (thread) => thread.id !== id,
            );
            return {
                ...prevState,
                threads,
                currentThreadIdx: threads.length - 1,
                saved: false,
            };
        });
}

export function removeAllThreadsHandler(
    setState: ChatDispatch,
    router: AppRouterInstance,
) {
    return () => {
        setState((prevState) => {
            prevState.abortRequest();
            const activeThread = getActiveThread(prevState);
            return {
                ...prevState,
                threads: [getDefaultThread(activeThread.agentConfig)],
                currentThreadIdx: null,
                input: '',
                saved: true,
                editId: null,
            };
        });
        router.replace('/');
    };
}

export function cancelEditHandler(setState: ChatDispatch) {
    return () => {
        setState((prevState) => ({
            ...prevState,
            editId: null,
            input: '',
        }));
    };
}

export function setPluginsEnabledHandler(setState: ChatDispatch) {
    return (pluginsEnabled: boolean) => {
        setState((prevState) => ({
            ...prevState,
            pluginsEnabled,
        }));
    };
}

export function changeInputHandler(setState: ChatDispatch) {
    return (newInput: string) => {
        setState((prevState) => ({
            ...prevState,
            input: newInput,
        }));
    };
}

export function abortRequestHandler(state: ChatState, setState: ChatDispatch) {
    return () => {
        state.abortController.abort();
        setState((prevState) => ({
            ...prevState,
            botTyping: false,
            saved: false,
        }));
    };
}

export function saveCharacterHandler(
    setState: ChatDispatch,
    userId?: string | null,
) {
    return async (character: AgentConfig) => {
        if (userId) upsertCharacter(character);
        setState((prevState) => {
            const characterList = prevState.characterList;
            const foundIndex = characterList.findIndex(
                (config) => config.id === character.id,
            );

            if (foundIndex !== -1) {
                characterList[foundIndex] = character;
            } else {
                characterList.push(character);
            }

            return {
                ...prevState,
                saved: false,
                characterList,
            };
        });
    };
}

export function setOpenAiApiKeyHandler(setState: ChatDispatch) {
    return (openAiApiKey?: string) => {
        setState((prevState) => ({
            ...prevState,
            openAiApiKey,
        }));
    };
}

export function setStreamResponseHandler(setState: ChatDispatch) {
    return (streamResponse: boolean) => {
        setState((prevState) => ({
            ...prevState,
            streamResponse,
        }));
    };
}

export function addMessageHandler(
    setState: ChatDispatch,
    router: AppRouterInstance,
) {
    return (message: Message, activeThread: ChatThread) => {
        const newMap = ChatManager.createMessage(
            message,
            activeThread.mapping,
            activeThread.currentNode,
        );

        setState((prevState) => upsertThreadState(prevState, newMap));
        setState((prevState) => upsertMessageState(prevState, message));
        router.replace('/?c=' + activeThread.id);
    };
}

export function changeBranchHandler(setState: ChatDispatch) {
    return (id: string) => {
        setState((prevState) => {
            prevState.abortRequest();
            const activeThread = getActiveThread(prevState);
            const newNode = ChatManager.findEndmostNode(
                id,
                activeThread.mapping,
            );
            if (!newNode) {
                throw new Error('Node not found');
            }
            return {
                ...prevState,
                input: '',
                editId: null,
                saved: false,
                threads: prevState.threads.map((thread) =>
                    thread.id === activeThread.id
                        ? {
                              ...thread,
                              currentNode: newNode,
                          }
                        : thread,
                ),
            };
        });
    };
}
