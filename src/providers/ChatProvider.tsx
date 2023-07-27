'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import {
    abortRequestHandler,
    cancelEditHandler,
    changeInputHandler,
    createSubmitHandler,
    createThreadHandler,
    editMessageHandler,
    getInitialActiveThread,
    removeMessageHandler,
    removeThreadHandler,
    removeAllThreadsHandler,
    setConfigHandler,
    setPluginsEnabledHandler,
    setSystemMessageHandler,
    togglePluginHandler,
    updateActiveThreadHandler,
    updateThreadConfigHandler,
} from './ChatProviderUtils';
import initialState from './initialChat';
import { saveThread } from '@/utils/server';

const ChatContext = createContext<ChatState>(initialState);

export const useChat = () => useContext(ChatContext);

type ChatProviderProps = {
    children: React.ReactNode;
    threadList: ChatThread[];
    savedConfig?: Config | null;
};

export function ChatProvider({
    children,
    threadList,
    savedConfig,
}: ChatProviderProps) {
    const router = useRouter();
    const params = useParams();
    const threadId = params.root ? params.root[0] : undefined;
    const [isNew, setIsNew] = useState<boolean>(threadId === undefined);

    const [state, setState] = useState<ChatState>({
        ...initialState,
        threads:
            threadList.length === 0 ? [initialState.activeThread] : threadList,
        input: initialState.input,
        editId: initialState.editId,
        pluginsEnabled: initialState.pluginsEnabled,
        config: initialState.config,
        botTyping: initialState.botTyping,
        abortController: new AbortController(),
        activeThread: getInitialActiveThread(savedConfig, threadId, threadList),
    });

    // Event Handlers
    const handleSubmit = createSubmitHandler(state, setState, router);
    const createThread = createThreadHandler(state, setState);
    const updateActiveThread = updateActiveThreadHandler(setState);

    useEffect(() => {
        if (!state.saved) {
            saveThread(state.activeThread);
            setState((prevState) => ({ ...prevState, saved: true }));
        }
    }, [state.saved, state.activeThread]);

    useEffect(() => {
        return () => {
            state.abortController?.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* 
        If threadId is undefined, create a new thread.
        If threadId is defined, check if it exists in the threadList.
            If it does, update the activeThread.
            If it doesn't, redirect to the home page and create a new thread.

        Since this checks every render and router.push and router.replace are asynchronous,
        we need to keep track of whether the thread is new or not.
    */
    useEffect(() => {
        console.log({ threadId, isNew, activeId: state.activeThread.id });
        if (!threadId) {
            if (!isNew) {
                console.log('no threadId, creating new thread');
                createThread();
                setIsNew(true);
            }
        } else if (state.activeThread.id !== threadId) {
            const newThread = state.threads.find((t) => t.id === threadId);
            if (newThread) {
                console.log('thread exists, updating active thread');
                updateActiveThread(newThread);
                setIsNew(false);
            } else {
                console.log('thread does not exist, redirecting to home');
                router.push('/');
                setIsNew(true);
            }
        }
    }, [
        createThread,
        isNew,
        router,
        state.activeThread.id,
        state.activeThread.messages.length,
        state.input,
        state.threads,
        threadId,
        updateActiveThread,
    ]);

    const value = {
        ...state,
        abortRequest: abortRequestHandler(state, setState),
        toggleplugin: togglePluginHandler(state, setState),
        setConfig: setConfigHandler(setState),
        updateThreadConfig: updateThreadConfigHandler(setState),
        setSystemMessage: setSystemMessageHandler(setState),
        editMessage: editMessageHandler(state, setState),
        removeMessage: removeMessageHandler(setState),
        removeThread: removeThreadHandler(state, setState, router),
        removeAllThreads: removeAllThreadsHandler(setState, router),
        cancelEdit: cancelEditHandler(setState),
        setPluginsEnabled: setPluginsEnabledHandler(setState),
        changeInput: changeInputHandler(setState),
        handleSubmit,
        createThread,
        updateActiveThread,
    };

    return (
        <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
    );
}
