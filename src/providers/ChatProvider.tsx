'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

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
    setOpenAiApiKeyHandler,
} from './ChatProviderUtils';
import { useUI } from './UIProvider';
import initialState from './initialChat';
import { upsertThread } from '@/utils/server/supabase';
import {
    getLocalCharacterList,
    getLocalOpenAiKey,
    getLocalThreadList,
    setLocalThreadList,
} from '@/utils/client/storage';

const ChatContext = createContext<ChatState>(initialState);

export const useChat = () => useContext(ChatContext);

export function ChatProvider({
    children,
    threadList,
    characterList,
}: {
    children: React.ReactNode;
    threadList: ChatThread[];
    characterList: AgentConfig[];
}) {
    const { userId } = useAuth();
    const router = useRouter();
    const params = useParams();
    const threadId = params.root
        ? params.root[0] !== 'index'
            ? params.root[0]
            : undefined
        : undefined;

    const { setOpenAIKeyOpen } = useUI();

    const [state, setState] = useState<ChatState>({
        ...initialState,
        characterList,
        threads: threadList,
        isNew: threadId === undefined,
        activeThread: getInitialActiveThread(
            characterList[0],
            threadId,
            threadList,
        ),
    });

    const createThread = createThreadHandler(state, setState);
    const updateActiveThread = updateActiveThreadHandler(setState);
    const setOpenAiApiKey = setOpenAiApiKeyHandler(setState);
    const abortRequest = abortRequestHandler(state, setState);

    useEffect(() => {
        // Load OpenAI API key from local storage
        const key = getLocalOpenAiKey();
        if (key) {
            setOpenAiApiKey(key);
        }

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
                if (userId) upsertThread(state.activeThread);
                if (window !== undefined) {
                    setLocalThreadList(state.threads);
                }
                setState((prevState) => ({ ...prevState, saved: true }));
            } catch (err) {
                console.error(err);
            }
        }
    }, [state.saved, state.activeThread, userId, state.threads]);

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
        setOpenAiApiKey,
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
        removeAllThreads: removeAllThreadsHandler(setState, router),
        handleSubmit: createSubmitHandler(
            state,
            setState,
            router,
            setOpenAIKeyOpen,
            userId,
        ),
    };

    return (
        <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
    );
}

function mergeThreads(
    oldThreads: ChatThread[],
    newThreads: ChatThread[],
): ChatThread[] {
    const threadMap = new Map<string, ChatThread>();

    // Add the old threads to the map
    oldThreads.forEach((thread) => {
        threadMap.set(thread.id, thread);
    });

    // Add the new threads to the map, replacing the old ones if the new one is more recent
    newThreads.forEach((thread) => {
        const existingThread = threadMap.get(thread.id);
        if (
            !existingThread ||
            existingThread.lastModified < thread.lastModified
        ) {
            threadMap.set(thread.id, thread);
        }
    });

    // Convert the map values back to an array
    return Array.from(threadMap.values());
}

function mergeCharacters(oldCharacters: any[], newCharacters: any[]): any[] {
    const characterMap = new Map<string, any>();

    // Add the old characters to the map
    oldCharacters.forEach((character) => {
        characterMap.set(character.name, character);
    });

    // Add the new characters to the map, replacing the old ones if the new one is more recent
    newCharacters.forEach((character) => {
        const existingCharacter = characterMap.get(character.id);
        if (
            !existingCharacter ||
            existingCharacter.lastModified < character.lastModified
        ) {
            characterMap.set(character.name, character);
        }
    });

    // Convert the map values back to an array
    return Array.from(characterMap.values());
}
