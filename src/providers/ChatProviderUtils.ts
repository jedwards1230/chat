'use client';

import { Dispatch, SetStateAction, FormEvent } from 'react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context';

import initialState, { getDefaultThread } from './initialChat';
import { createUserMsg, fetchTitle, getChat } from '@/utils/client';
import { deleteMessage } from '@/utils/server';

type ChatDispatch = Dispatch<SetStateAction<ChatState>>;

export function getInitialActiveThread(
    savedConfig: Config | null | undefined,
    activeId: string | null | undefined,
    threadList: ChatThread[],
) {
    const requestedThread = threadList.find((thread) => thread.id === activeId);
    return (
        requestedThread || {
            ...initialState.activeThread,
            agentConfig: {
                ...initialState.activeThread.agentConfig,
                ...(savedConfig ? savedConfig : initialState.config),
            },
        }
    );
}

export function createSubmitHandler(
    state: ChatState,
    setState: ChatDispatch,
    router: AppRouterInstance,
) {
    return async (e: FormEvent) => {
        e.preventDefault();
        if (state.input.trim() === '') return;
        router.push('/' + state.activeThread.id);

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
                    threads,
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
                    threads,
                };
            });
        };

        const userMsg: Message = createUserMsg(state.input, state.editId);

        setState((prevState) => ({
            ...prevState,
            input: '',
            botTyping: true,
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

        await Promise.all([
            getChat(
                msgHistory,
                state.abortController,
                state.activeThread,
                state.pluginsEnabled,
                0,
                setState,
                upsertMessage,
            ),
            fetchTitle(state.activeThread, state.input, upsertTitle),
        ]);
    };
}

export function createThreadHandler(state: ChatState, setState: ChatDispatch) {
    return () => {
        state.abortRequest();

        setState((prevState) => {
            const newThread = getDefaultThread(state.config);
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
        setState((prevState) => ({
            ...prevState,
            activeThread: newThread || getDefaultThread(prevState.config),
            input: '',
        }));
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
    return (newConfig: Config) => {
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
        setState((prevState) => ({
            ...prevState,
            lastModified: new Date(),
            activeThread: {
                ...prevState.activeThread,
                agentConfig: {
                    ...prevState.activeThread.agentConfig,
                    ...configUpdates,
                },
            },
        }));
    };
}

export function setSystemMessageHandler(setState: ChatDispatch) {
    return (systemMessage: string) => {
        setState((prevState) => ({
            ...prevState,
            lastModified: new Date(),
            activeThread: {
                ...prevState.activeThread,
                lastModified: new Date(),
                systemMessage,
                agentConfig: {
                    ...prevState.activeThread.agentConfig,
                    systemMessage,
                },
                messages: [
                    {
                        ...prevState.activeThread.messages[0],
                        message: systemMessage,
                    },
                    ...prevState.activeThread.messages.slice(1),
                ],
            },
        }));
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
            input: msg.content,
            saved: false,
        }));
    };
}

export function removeMessageHandler(setState: ChatDispatch) {
    return (id: string) => {
        deleteMessage(id);
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
            router.push('/');
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
                activeThread: getDefaultThread(prevState.config),
                input: '',
                saved: true,
            };
        });
        router.push('/');
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

/* 

export function createThreadInsertHandler(setState: ChatDispatch) {
    return async (
        payload: RealtimePostgresInsertPayload<{
            [key: string]: any;
        }>,
    ) => {
        const newThreadId = payload.new.id;

        // Fetch messages only related to the newly created thread
        const { data: threadMessages, error: messageError } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_thread_id', newThreadId)
            .order('message_order', { ascending: true });

        if (messageError) {
            throw new Error(messageError.message);
        }

        setState((prevState) => ({
            ...prevState,
            threads: [
                ...prevState.threads,
                {
                    ...payload.new,
                    messages: threadMessages,
                } as ChatThread,
            ],
        }));
    };
}

export function createThreadUpdateHandler(setState: ChatDispatch) {
    return async (
        payload: RealtimePostgresUpdatePayload<{
            [key: string]: any;
        }>,
    ) => {
        const newThreadId = payload.new.id;

        // Fetch messages only related to the newly created thread
        const { data: threadMessages, error: messageError } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_thread_id', newThreadId)
            .order('message_order', { ascending: true });

        if (messageError) {
            throw new Error(messageError.message);
        }

        setState((prevState) => ({
            ...prevState,
            threads: prevState.threads.map((thread) => {
                if (thread.id === newThreadId) {
                    return {
                        ...thread,
                        ...payload.new,
                        messages: threadMessages,
                    };
                }
                return thread;
            }),
        }));
    };
}

export function createThreadDeleteHandler(setState: ChatDispatch) {
    return (
        payload: RealtimePostgresDeletePayload<{
            [key: string]: any;
        }>,
    ) => {
        setState((prevState) => ({
            ...prevState,
            threads: prevState.threads.filter(
                (thread) => thread.id !== payload.old.id,
            ),
        }));
    };
}

export function subscribeToThreadEvents(
    handleThreadInsert: (
        payload: RealtimePostgresInsertPayload<{
            [key: string]: any;
        }>,
    ) => void,
    handleThreadUpdate: (
        payload: RealtimePostgresUpdatePayload<{
            [key: string]: any;
        }>,
    ) => void,
    handleThreadDelete: (
        payload: RealtimePostgresDeletePayload<{
            [key: string]: any;
        }>,
    ) => void,
) {
    const onThreadInsert = supabase
        .channel('supabase_realtime')
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_threads',
            },
            handleThreadInsert,
        )
        .subscribe();

    const onThreadUpdate = supabase
        .channel('supabase_realtime')
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'chat_threads',
            },
            handleThreadUpdate,
        )
        .subscribe();

    const onThreadDelete = supabase
        .channel('supabase_realtime')
        .on(
            'postgres_changes',
            {
                event: 'DELETE',
                schema: 'public',
                table: 'chat_threads',
            },
            handleThreadDelete,
        )
        .subscribe();

    return {
        onThreadInsert,
        onThreadUpdate,
        onThreadDelete,
    };
}

export function unsubscribeFromThreadEvents(
    handleThreadInsert: RealtimeChannel,
    handleThreadUpdate: RealtimeChannel,
    handleThreadDelete: RealtimeChannel,
) {
    supabase.removeChannel(handleThreadInsert);
    supabase.removeChannel(handleThreadUpdate);
    supabase.removeChannel(handleThreadDelete);
}
*/
