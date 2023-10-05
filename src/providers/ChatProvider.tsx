'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlausible } from 'next-plausible';
import { useSession } from 'next-auth/react';

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
    setStreamResponseHandler,
    setPluginsEnabledHandler,
    setSystemMessageHandler,
    togglePluginHandler,
    updateThreadConfigHandler,
    saveCharacterHandler,
    setOpenAiApiKeyHandler,
} from './ChatProviderUtils';
import { useUI } from './UIProvider';
import initialState from './initialChat';
import Dialogs from '@/components/Dialogs';
import { upsertThread } from '@/utils/server/supabase';
import { mergeThreads, mergeCharacters, sortThreadlist } from '@/utils';
import {
    getLocalCharacterList,
    getLocalOpenAiKey,
    getLocalThreadList,
    setLocalThreadList,
} from '@/utils/client/localstorage';

const ChatContext = createContext<ChatState>(initialState);

export const useChat = () => useContext(ChatContext);

export function ChatProvider({
    children,
    threadList,
    characterList,
    threadId,
}: {
    children: React.ReactNode;
    threadList: ChatThread[];
    characterList: AgentConfig[];
    threadId?: string;
}) {
    const plausible = usePlausible();
    const { data: session } = useSession();
    const userId = session?.user?.email;
    const router = useRouter();

    const { setAppSettingsOpen } = useUI();

    const defaultCharacter = characterList.find((c) => c.name === 'Chat');

    const currentThread = getInitialActiveThread(
        defaultCharacter || characterList[0],
        threadId,
        threadList,
    );

    const defaultThread = defaultCharacter
        ? {
              ...initialState.defaultThread,
              agentConfig: defaultCharacter,
          }
        : initialState.defaultThread;

    const [state, setState] = useState<ChatState>({
        ...initialState,
        characterList,
        currentThread,
        defaultThread,
        threads: threadList.sort(sortThreadlist),
    });

    const createThread = createThreadHandler(state, setState);
    const setOpenAiApiKey = setOpenAiApiKeyHandler(setState);
    const abortRequest = abortRequestHandler(state, setState);

    // Load local data
    useEffect(() => {
        // Load OpenAI API key from local storage
        const key = getLocalOpenAiKey();
        if (key) setOpenAiApiKey(key);

        // Load threads from local storage if not connected to db
        setState((prevState) => ({
            ...prevState,
            saved: false,
            threads: mergeThreads(prevState.threads, getLocalThreadList()),
            characterList: mergeCharacters(
                prevState.characterList,
                getLocalCharacterList(),
            ),
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Save thread when it is updated
    useEffect(() => {
        if (!state.saved && state.currentThread !== null) {
            try {
                const thread = state.threads[state.currentThread];
                if (userId) upsertThread(thread);
                if (window !== undefined) {
                    setLocalThreadList(state.threads);
                }
                setState((prevState) => ({ ...prevState, saved: true }));
            } catch (err) {
                console.error(err);
            }
        }
    }, [state.saved, state.currentThread, userId, state.threads]);

    // Update active thread when threadId changes
    useEffect(() => {
        if (!threadId) return;

        const thread =
            state.currentThread !== null
                ? state.threads[state.currentThread]
                : state.defaultThread;

        if (thread.id === threadId) return;

        const newThread = state.threads.find((t) => t.id === threadId);
        if (newThread) {
            setState((prevState) => ({
                ...prevState,
                isNew: false,
                input: '',
                currentThread: prevState.threads.findIndex(
                    (thread) => thread.id === threadId,
                ),
            }));
        } else {
            router.replace('/');
            setState((prevState) => ({
                ...prevState,
                isNew: true,
            }));
        }
    }, [
        router,
        threadId,
        state.threads,
        createThread,
        state.currentThread,
        state.defaultThread,
    ]);

    const value: ChatState = {
        ...state,
        abortRequest,
        createThread,
        setOpenAiApiKey,
        cancelEdit: cancelEditHandler(setState),
        changeInput: changeInputHandler(setState),
        removeThread: removeThreadHandler(setState),
        saveCharacter: saveCharacterHandler(setState),
        removeMessage: removeMessageHandler(setState),
        editMessage: editMessageHandler(setState),
        toggleplugin: togglePluginHandler(setState),
        setSystemMessage: setSystemMessageHandler(setState),
        setStreamResponse: setStreamResponseHandler(setState),
        setPluginsEnabled: setPluginsEnabledHandler(setState),
        updateThreadConfig: updateThreadConfigHandler(setState),
        removeAllThreads: removeAllThreadsHandler(setState, router),
        handleSubmit: createSubmitHandler(
            plausible,
            state,
            setState,
            router,
            setAppSettingsOpen,
            userId,
        ),
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
            <Dialogs threadId={threadId} />
        </ChatContext.Provider>
    );
}
