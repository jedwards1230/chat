'use client';

import { Dispatch, SetStateAction, FormEvent } from 'react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import initialState, { getDefaultThread } from './initialChat';
import { createUserMsg, getTitle, getChat } from '@/utils/client';
import { deleteMessageById, upsertCharacter } from '@/utils/server/supabase';
import { sortThreadlist } from '@/utils';
import { getToolData } from '@/utils/client/chat';
import { baseCommands } from '@/tools/commands';

type ChatDispatch = Dispatch<SetStateAction<ChatState>>;

export function getInitialActiveThread(
    savedConfig: AgentConfig,
    activeId: string | null | undefined,
    threadList: ChatThread[],
) {
    const requestedThread = threadList.find((thread) => thread.id === activeId);
    return (
        requestedThread || {
            ...initialState.activeThread,
            ...(savedConfig || initialState.activeThread.agentConfig),
        }
    );
}

type PlausibleHook = (
    eventName: string,
    {
        props: { threadId, usedCloudKey },
    }: {
        props: { threadId: string; usedCloudKey: boolean };
    },
) => any;

export function createSubmitHandler(
    plausible: PlausibleHook,
    state: ChatState,
    setState: ChatDispatch,
    router: AppRouterInstance,
    openKeyDialog: (open: boolean | AppSettingsSection) => void,
    userId?: string | null,
) {
    return async (e: FormEvent) => {
        e.preventDefault();
        if (state.input.trim() === '') return;
        if (!state.openAiApiKey && !userId) {
            return openKeyDialog('Credentials');
        }

        router.replace('/?c=' + state.activeThread.id);
        plausible('Submitted Message', {
            props: {
                threadId: state.activeThread.id,
                usedCloudKey: !!state.openAiApiKey,
            },
        });

        const upsertMessage = (newMessage: Message) => {
            setState((prevState) => {
                const messages = [...prevState.activeThread.messages];
                const foundIndex = messages.findIndex(
                    (message) => message.id === newMessage.id,
                );

                if (foundIndex !== -1) {
                    messages[foundIndex] = newMessage;
                } else {
                    messages.push(newMessage);
                }

                const activeThread = {
                    ...prevState.activeThread,
                    lastModified: new Date(),
                    messages,
                };

                const threads = [...prevState.threads];
                const foundThreadIndex = threads.findIndex(
                    (thread) => thread.id === prevState.activeThread.id,
                );

                if (foundThreadIndex !== -1) {
                    threads[foundThreadIndex] = activeThread;
                } else {
                    threads.push(activeThread);
                }

                return {
                    ...prevState,
                    activeThread,
                    threads: threads.sort(sortThreadlist),
                };
            });
        };

        const upsertTitle = (title: string) => {
            document.title = 'Chat | ' + title;
            setState((prevState) => {
                const activeThread = {
                    ...prevState.activeThread,
                    lastModified: new Date(),
                    title,
                };

                const threads = [...prevState.threads];
                const foundThreadIndex = threads.findIndex(
                    (thread) => thread.id === prevState.activeThread.id,
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
                    activeThread,
                    threads: threads.sort(sortThreadlist),
                };
            });
        };

        const parts = state.input.split(' ');
        const command = parts[0] as Command;
        const query = parts.slice(1).join(' ');

        const toolInput =
            command in baseCommands
                ? {
                      name: baseCommands[command],
                      args: query,
                  }
                : undefined;

        const userMsg = createUserMsg(state.input, state.editId);

        const controller = new AbortController();
        setState((prevState) => ({
            ...prevState,
            input: '',
            botTyping: true,
            abortController: controller,
            editId: prevState.editId ? null : prevState.editId,
        }));
        upsertMessage(userMsg);

        const msgHistory = state.activeThread.messages;
        if (state.editId) {
            const editIndex = msgHistory.findIndex(
                (msg) => msg.id === state.editId,
            );
            msgHistory[editIndex] = userMsg;
        } else {
            msgHistory.push(userMsg);
        }

        // Fetch chat
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
            getTitle(
                state.activeThread,
                query,
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
            const newThread = getDefaultThread(state.activeThread.agentConfig);
            return {
                ...prevState,
                activeThread: newThread,
                threads: [...prevState.threads, newThread],
                input: '',
                botTyping: false,
                isNew: true,
            };
        });
    };
}

export function updateActiveThreadHandler(setState: ChatDispatch) {
    return (newThread?: ChatThread) => {
        setState((prevState) => {
            return {
                ...prevState,
                activeThread:
                    newThread ||
                    getDefaultThread(prevState.activeThread.agentConfig),
                input: '',
            };
        });
    };
}

export function togglePluginHandler(state: ChatState, setState: ChatDispatch) {
    return (tool: Tool) => {
        const tools = state.activeThread.agentConfig.tools;
        setState((prevState) => ({
            ...prevState,
            activeThread: {
                ...prevState.activeThread,
                agentConfig: {
                    ...prevState.activeThread.agentConfig,
                    tools: tools.includes(tool)
                        ? tools.filter((t) => t !== tool)
                        : [...tools, tool],
                },
            },
        }));
    };
}

export function setConfigHandler(setState: ChatDispatch) {
    return (newConfig: AgentConfig) => {
        setState((prevState) => ({
            ...prevState,
            config: newConfig,
            activeThread: {
                ...prevState.activeThread,
                agentConfig: {
                    ...prevState.activeThread.agentConfig,
                    ...newConfig,
                },
            },
        }));
    };
}

export function updateThreadConfigHandler(setState: ChatDispatch) {
    return (configUpdates: Partial<AgentConfig>) => {
        setState((prevState) => {
            const newConfig: AgentConfig = {
                ...prevState.activeThread.agentConfig,
                ...configUpdates,
            };

            if (
                (configUpdates.toolsEnabled === true &&
                    newConfig.model.api === 'llama') ||
                configUpdates.model?.api === 'llama'
            )
                newConfig.toolsEnabled = false;

            return {
                ...prevState,
                lastModified: new Date(),
                streamResponse:
                    newConfig.model.api === 'llama'
                        ? false
                        : prevState.streamResponse,
                activeThread: {
                    ...prevState.activeThread,
                    agentConfig: {
                        ...prevState.activeThread.agentConfig,
                        ...newConfig,
                    },
                },
            };
        });
    };
}

export function setSystemMessageHandler(setState: ChatDispatch) {
    return (systemMessage: string) => {
        setState((prevState) => {
            const activeThread: ChatThread = {
                ...prevState.activeThread,
                lastModified: new Date(),
                agentConfig: {
                    ...prevState.activeThread.agentConfig,
                    systemMessage,
                },
                messages: [
                    {
                        ...prevState.activeThread.messages[0],
                        content: systemMessage,
                    },
                    ...prevState.activeThread.messages.slice(1),
                ],
            };

            return {
                ...prevState,
                lastModified: new Date(),
                activeThread,
                threads: prevState.threads.map((thread) =>
                    thread.id === activeThread.id ? activeThread : thread,
                ),
            };
        });
    };
}

export function editMessageHandler(state: ChatState, setState: ChatDispatch) {
    return (id: string) => {
        const msg = state.activeThread.messages.find((msg) => msg.id === id);
        if (!msg) {
            console.error('No message to edit');
            return;
        }

        setState((prevState) => ({
            ...prevState,
            editId: id,
            input: msg.content || '',
            saved: false,
        }));
    };
}

export function removeMessageHandler(setState: ChatDispatch) {
    return (id: string) => {
        deleteMessageById(id);
        setState((prevState) => ({
            ...prevState,
            saved: false,
            activeThread: {
                ...prevState.activeThread,
                messages: prevState.activeThread.messages.filter(
                    (msg) => msg.id !== id,
                ),
                lastModified: new Date(),
            },
        }));
    };
}

export function removeThreadHandler(
    state: ChatState,
    setState: ChatDispatch,
    router: AppRouterInstance,
) {
    return (id: string) => {
        setState((prevState) => ({
            ...prevState,
            threads: prevState.threads.filter((thread) => thread.id !== id),
            saved: prevState.activeThread.id === id ? true : prevState.saved,
        }));
        if (state.activeThread.id === id) {
            state.createThread();
            router.replace('/');
        }
    };
}

export function removeAllThreadsHandler(
    setState: ChatDispatch,
    router: AppRouterInstance,
) {
    return () => {
        setState((prevState) => {
            prevState.abortRequest();
            return {
                ...prevState,
                threads: [],
                activeThread: getDefaultThread(
                    prevState.activeThread.agentConfig,
                ),
                input: '',
                saved: true,
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
