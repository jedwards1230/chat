'use client';

import { v4 as uuid } from 'uuid';
import { Dispatch, SetStateAction, FormEvent } from 'react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import { getDefaultThread } from './initialChat';
import { createUserMsg, getTitle, getChat } from '@/utils/client';
import { deleteMessageById, upsertCharacter } from '@/utils/server/supabase';
import { sortThreadlist } from '@/utils';
import { getToolData } from '@/utils/client/chat';
import { baseCommands } from '@/tools/commands';
import ChatManager from '@/lib/ChatManager';
import { defaultAgentConfig } from './characters';

type ChatDispatch = Dispatch<SetStateAction<ChatState>>;

function createMessage(role: Role) {
    return {
        id: uuid(),
        content: '',
        role,
        createdAt: new Date(),
    };
}

export function getInitialActiveThread(
    savedConfig: AgentConfig,
    activeId: string | null | undefined,
    threadList: ChatThread[],
): [ChatThread, number | undefined] {
    for (let i = 0; i < threadList.length; i++) {
        if (threadList[i].id === activeId) {
            return [threadList[i], i];
        }
    }

    const initialThread: ChatThread = {
        ...getDefaultThread(defaultAgentConfig),
        ...(savedConfig && { agentConfig: savedConfig }),
        lastModified: new Date(),
    };

    return [initialThread, undefined];
}

function upsertMessageState(
    prevState: ChatState,
    newMessage: Message,
): ChatState {
    const activeThread: ChatThread = {
        ...prevState.threads[prevState.currentThread],
        lastModified: new Date(),
    };

    console.log(activeThread);
    console.log({ threads: prevState.threads });

    if (activeThread.mapping[newMessage.id]) {
        activeThread.mapping = ChatManager.updateMessage(
            newMessage,
            activeThread.mapping,
        );
    } else {
        const { newMapping, newCurrentNode } = ChatManager.createMessage(
            newMessage,
            activeThread.mapping,
            activeThread.currentNode,
        );
        activeThread.currentNode = newCurrentNode;
        activeThread.mapping = newMapping;
    }

    const threads = [...prevState.threads];
    const foundThreadIndex = threads.findIndex(
        (thread) => thread.id === activeThread.id,
    );

    if (foundThreadIndex !== -1) {
        threads[foundThreadIndex] = activeThread;
    } else {
        threads.push(activeThread);
    }

    return {
        ...prevState,
        currentThread: threads.length - 1,
        threads: threads.sort(sortThreadlist),
    };
}

function upsertTitleState(prevState: ChatState, title: string): ChatState {
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

    return async (e: FormEvent) => {
        e.preventDefault();
        if (state.input.trim() === '') return;
        if (!state.openAiApiKey && !userId) {
            return openKeyDialog('Credentials');
        }

        const activeThread = state.threads[state.currentThread];

        router.replace('/?c=' + activeThread.id);
        plausible('Submitted Message', {
            props: {
                threadId: activeThread.id,
                usedCloudKey: !!state.openAiApiKey,
            },
        });

        const userMsg = createUserMsg(state.input, state.editId);
        upsertMessage(userMsg);

        let newMapping: MessageMapping | undefined;
        let newCurrentNode: string | null = activeThread.currentNode;
        if (state.editId) {
            newMapping = ChatManager.editMessageAndFork(
                state.editId,
                userMsg,
                activeThread.mapping,
            );
        } else {
            const newMessage = ChatManager.createMessage(
                userMsg,
                activeThread.mapping,
                activeThread.currentNode,
            );
            newMapping = newMessage.newMapping;
            newCurrentNode = newMessage.newCurrentNode;
        }

        const controller = new AbortController();
        setState((prevState) => {
            const prevThread = prevState.threads[prevState.currentThread];
            const newThread: ChatThread = {
                ...prevThread,
                mapping: newMapping || prevThread.mapping,
                currentNode: newCurrentNode || prevThread.currentNode,
                lastModified: new Date(),
            };
            const threads = [...prevState.threads, newThread];

            return {
                ...prevState,
                input: '',
                botTyping: true,
                abortController: controller,
                editId: prevState.editId ? null : prevState.editId,
                threads,
                currentThread: threads.length - 1,
            };
        });

        const msgHistory = ChatManager.getOrderedMessages(
            newCurrentNode,
            newMapping,
        );

        const toolInput = getToolInput(state.input);
        toolInput
            ? await getToolData({
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
                  msgHistory,
                  controller,
                  state,
                  loops: 0,
                  setState,
                  upsertMessage,
                  userId,
              });

        // Fetch title only if it's an initial message
        if (state.isNew) {
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
            const newThread = getDefaultThread(
                prevState.threads[prevState.currentThread].agentConfig,
            );
            const threads = [...prevState.threads, newThread];
            return {
                ...prevState,
                currentThread: threads.length - 1,
                threads,
                input: '',
                botTyping: false,
                isNew: true,
                editId: null,
            };
        });
    };
}

export function updateActiveThreadHandler(setState: ChatDispatch) {
    return (newThread: ChatThread) => {
        setState((prevState) => {
            const threads = prevState.threads;
            threads[prevState.currentThread] = newThread;

            return {
                ...prevState,
                threads,
                input: '',
            };
        });
    };
}

export function togglePluginHandler(setState: ChatDispatch) {
    return (tool: Tool) => {
        setState((prevState) => {
            const activeThread = prevState.threads[prevState.currentThread];
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
            const activeThread = prevState.threads[prevState.currentThread];
            const newConfig: AgentConfig = {
                ...activeThread.agentConfig,
                ...configUpdates,
            };

            if (
                (configUpdates.toolsEnabled === true &&
                    newConfig.model.api === 'llama') ||
                configUpdates.model?.api === 'llama'
            )
                newConfig.toolsEnabled = false;

            const threads = prevState.threads.map((thread) =>
                thread.id === activeThread.id
                    ? {
                          ...thread,
                          agentConfig: newConfig,
                      }
                    : thread,
            );

            return {
                ...prevState,
                threads,
                lastModified: new Date(),
                streamResponse:
                    newConfig.model.api === 'llama'
                        ? false
                        : prevState.streamResponse,
            };
        });
    };
}

export function setSystemMessageHandler(setState: ChatDispatch) {
    return (systemMessage: string) => {
        setState((prevState) => {
            const activeThread = prevState.threads[prevState.currentThread];
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
                            ...createMessage('system'),
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
            const activeThread = prevState.threads[prevState.currentThread];
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
            const activeThread = prevState.threads[prevState.currentThread];
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
            const activeThread = prevState.threads[prevState.currentThread];
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

export function saveCharacterHandler(setState: ChatDispatch) {
    return async (character: AgentConfig) => {
        upsertCharacter(character);
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
