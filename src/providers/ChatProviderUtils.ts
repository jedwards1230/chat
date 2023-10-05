'use client';

import { Dispatch, SetStateAction, FormEvent } from 'react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import { getDefaultThread, resetDefaultThread } from './initialChat';
import { getTitle, getChat } from '@/utils/client';
import { deleteMessageById, upsertCharacter } from '@/utils/server/supabase';
import { sortThreadlist } from '@/utils';
import { createMessage, getToolData } from '@/utils/client/chat';
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
): ChatState {
    if (prevState.currentThread === null) return prevState;
    const active = prevState.threads[prevState.currentThread];

    const { newMapping, newCurrentNode } = ChatManager.upsertMessage(
        newMessage,
        active.mapping,
        active.currentNode,
    );

    const threads = [...prevState.threads];
    const newThread: ChatThread = {
        ...active,
        mapping: newMapping,
        currentNode: newCurrentNode,
        lastModified: new Date(),
    };
    threads[prevState.currentThread] = newThread;

    return {
        ...prevState,
        threads,
    };
}

/** Upsert Title into ChatThread */
function upsertTitleState(prevState: ChatState, title: string): ChatState {
    if (prevState.currentThread === null) return prevState;
    const threads = prevState.threads;
    const activeThread = {
        ...threads[prevState.currentThread],
        lastModified: new Date(),
        title,
    };

    const foundThreadIndex = threads.findIndex(
        (thread) => thread.id === activeThread.id,
    );

    if (foundThreadIndex !== -1) {
        threads[foundThreadIndex] = {
            ...threads[foundThreadIndex],
            lastModified: new Date(),
            title,
        };
    } else {
        threads.push(activeThread);
    }

    return {
        ...prevState,
        currentThread: threads.length - 1,
        threads: threads.sort(sortThreadlist),
    };
}

/**
 * Create new thread
 * - If isNew, create new thread with default config
 * - If not isNew, add to current thread
 * */
function createNewThread(
    prevState: ChatState,
    newMap: NewMapping,
    controller: AbortController,
): ChatState {
    const newState = {
        ...prevState,
        editId: prevState.editId ? null : prevState.editId,
        abortController: controller,
        input: '',
        botTyping: true,
    };

    const newThread: ChatThread =
        prevState.currentThread === null
            ? { ...prevState.defaultThread }
            : {
                  ...prevState.threads[prevState.currentThread],
                  mapping: newMap.newMapping,
                  currentNode: newMap.newCurrentNode,
                  lastModified: new Date(),
              };

    const threads = [...prevState.threads];
    if (prevState.currentThread === null) {
        threads.push(newThread);
    }

    return {
        ...newState,
        threads,
        botTyping: true,
        currentThread: threads.length - 1,
        ...(prevState.currentThread === null && {
            defaultThread: resetDefaultThread(),
        }),
    };
}

const getActiveThread = (state: ChatState): ChatThread =>
    state.currentThread === null
        ? state.defaultThread
        : state.threads[state.currentThread];

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

    const upsertMessage = (newMessage: Message) =>
        setState((prevState) => upsertMessageState(prevState, newMessage));

    const upsertTitle = (title: string) => {
        document.title = 'Chat | ' + title;
        setState((prevState) => upsertTitleState(prevState, title));
    };

    const getNewMapping = (
        activeThread: ChatThread,
        msg: Message,
        editId?: string | null,
    ): NewMapping => {
        if (editId) {
            const newMapping = ChatManager.editMessageAndFork(
                editId,
                msg,
                activeThread.mapping,
            );
            return {
                newMapping,
                newCurrentNode: activeThread.currentNode,
            };
        }

        const newMessage = ChatManager.createMessage(
            msg,
            activeThread.mapping,
            activeThread.currentNode,
        );
        return {
            newMapping: newMessage.newMapping,
            newCurrentNode: newMessage.newCurrentNode,
        };
    };

    return async (e: FormEvent) => {
        e.preventDefault();
        if (state.input.trim() === '') return;
        if (!state.openAiApiKey && !userId) {
            return openKeyDialog('Credentials');
        }

        const activeThread = getActiveThread(state);

        router.replace('/?c=' + activeThread.id);
        plausible('Submitted Message', {
            props: {
                threadId: activeThread.id,
                usedCloudKey: !!state.openAiApiKey,
            },
        });

        // create user message
        const userMsg = createMessage({
            role: 'user',
            content: state.input,
            id: state.editId || undefined,
        });

        // create new mapping and ordered list of messages
        const newMap = getNewMapping(activeThread, userMsg, state.editId);
        const msgHistory = ChatManager.getOrderedMessages(
            newMap.newCurrentNode,
            newMap.newMapping,
        );

        // create new thread
        const controller = new AbortController();
        setState((prevState) => createNewThread(prevState, newMap, controller));
        upsertMessage(userMsg);

        const toolInput = getToolInput(state.input);
        toolInput
            ? await getToolData({
                  activeThread,
                  toolInput,
                  msgHistory,
                  upsertMessage,
                  controller,
                  state,
                  setState,
                  loops: 0,
                  userId,
              })
            : await getChat({
                  activeThread,
                  msgHistory,
                  controller,
                  state,
                  loops: 0,
                  setState,
                  upsertMessage,
                  userId,
              });

        // Fetch title only if it's an initial message
        if (state.currentThread === null) {
            await getTitle(
                activeThread,
                state.input,
                upsertTitle,
                userId,
                state.openAiApiKey,
            );
        }
    };
}

export function createThreadHandler(state: ChatState, setState: ChatDispatch) {
    return () => {
        state.abortController?.abort();
        setState((prevState) => {
            return {
                ...prevState,
                currentThread: null,
                defaultThread: resetDefaultThread(),
                input: '',
                botTyping: false,
                isNew: true,
                editId: null,
            };
        });
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

            const threads = [...prevState.threads];
            if (prevState.currentThread) {
                threads[prevState.currentThread] = {
                    ...threads[prevState.currentThread!],
                    agentConfig,
                };
                return {
                    ...prevState,
                    threads,
                    lastModified: new Date(),
                    streamResponse,
                };
            } else {
                const defaultThread = {
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
                const { newMapping, newCurrentNode } =
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
            activeThread.mapping = ChatManager.deleteMessage(
                id,
                activeThread.mapping,
            );
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
                currentThread: threads.length - 1,
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
                currentThread: 0,
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
