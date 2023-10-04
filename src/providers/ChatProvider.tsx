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
    updateActiveThreadHandler,
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

    const [initialThread, currentThread] = getInitialActiveThread(
        characterList.find((c) => c.name === 'Chat') || characterList[0],
        threadId,
        threadList,
    );

    if (currentThread === undefined) {
        threadList.push(initialThread);
    }

    const [state, setState] = useState<ChatState>({
        ...initialState,
        characterList,
        threads: threadList.sort(sortThreadlist),
        isNew: threadId === undefined,
        currentThread: currentThread || 0,
    });

    const createThread = createThreadHandler(state, setState);
    const updateActiveThread = updateActiveThreadHandler(setState);
    const setOpenAiApiKey = setOpenAiApiKeyHandler(setState);
    const abortRequest = abortRequestHandler(state, setState);

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
        if (!state.saved) {
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
        const thread = state.threads[state.currentThread];
        if (thread.id === threadId) return;
        if (!threadId) {
            if (!state.isNew) createThread();
            return;
        }

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
    }, [
        router,
        threadId,
        state.isNew,
        state.threads,
        createThread,
        updateActiveThread,
        state.currentThread,
    ]);

    const value: ChatState = {
        ...state,
        abortRequest,
        createThread,
        setOpenAiApiKey,
        updateActiveThread,
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
            <Dialogs />
        </ChatContext.Provider>
    );
}
