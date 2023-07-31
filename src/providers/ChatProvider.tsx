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
    saveCharacterHandler,
} from './ChatProviderUtils';
import initialState from './initialChat';
import { saveThread, saveCharacterList } from '@/utils/server';

const ChatContext = createContext<ChatState>(initialState);

export const useChat = () => useContext(ChatContext);

export function ChatProvider({
    children,
    threadList,
    characters,
}: {
    children: React.ReactNode;
    threadList: ChatThread[];
    characters: AgentConfig[] | null;
}) {
    const router = useRouter();
    const params = useParams();
    const threadId = params.root
        ? params.root[0] !== 'index'
            ? params.root[0]
            : undefined
        : undefined;

    const characterList = characters || initialState.characterList;
    const threads =
        threadList.length === 0 ? [initialState.activeThread] : threadList;
    const [state, setState] = useState<ChatState>({
        ...initialState,
        characterList,
        threads,
        isNew: threadId === undefined,
        activeThread: getInitialActiveThread(
            characterList[0],
            threadId,
            threadList,
        ),
    });

    const createThread = createThreadHandler(state, setState);
    const updateActiveThread = updateActiveThreadHandler(setState);
    const abortRequest = abortRequestHandler(state, setState);

    // Save thread when it is updated
    useEffect(() => {
        if (!state.saved) {
            try {
                saveThread(state.activeThread);
                setState((prevState) => ({ ...prevState, saved: true }));
            } catch (err) {
                console.error(err);
            }
        }
    }, [state.saved, state.activeThread]);

    useEffect(() => {
        if (!characters) {
            try {
                saveCharacterList(state.characterList);
            } catch (err) {
                console.error(err);
            }
        }
        return () => {
            abortRequest();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update active thread when threadId changes
    useEffect(() => {
        if (!threadId) {
            if (!state.isNew) {
                createThread();
                setState((prevState) => ({
                    ...prevState,
                    isNew: true,
                }));
            }
        } else if (state.activeThread.id !== threadId) {
            const newThread = state.threads.find((t) => t.id === threadId);
            if (newThread) {
                updateActiveThread(newThread);
                setState((prevState) => ({
                    ...prevState,
                    isNew: false,
                }));
            } else {
                router.replace('/');
                setState((prevState) => ({
                    ...prevState,
                    isNew: true,
                }));
            }
        }
    }, [
        router,
        threadId,
        state.input,
        state.isNew,
        state.threads,
        state.activeThread.id,
        state.activeThread.messages.length,
        createThread,
        updateActiveThread,
    ]);

    const value: ChatState = {
        ...state,
        abortRequest,
        createThread,
        updateActiveThread,
        setConfig: setConfigHandler(setState),
        cancelEdit: cancelEditHandler(setState),
        changeInput: changeInputHandler(setState),
        saveCharacter: saveCharacterHandler(setState),
        removeMessage: removeMessageHandler(setState),
        editMessage: editMessageHandler(state, setState),
        toggleplugin: togglePluginHandler(state, setState),
        setSystemMessage: setSystemMessageHandler(setState),
        setPluginsEnabled: setPluginsEnabledHandler(setState),
        updateThreadConfig: updateThreadConfigHandler(setState),
        removeThread: removeThreadHandler(state, setState, router),
        handleSubmit: createSubmitHandler(state, setState, router),
        removeAllThreads: removeAllThreadsHandler(setState, router),
    };

    return (
        <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
    );
}
