'use client';

import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePlausible } from 'next-plausible';
import { useSession } from 'next-auth/react';

import {
    abortRequestHandler,
    cancelEditHandler,
    changeInputHandler,
    createSubmitHandler,
    clearChatHandler,
    createThreadHandler,
    editMessageHandler,
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
    addMessageHandler,
    changeBranchHandler,
    regenerateChatHandler,
    upsertTitleState,
} from './ChatProviderUtils';
import {
    getCharacterListByUserId,
    getThreadListByUserId,
} from '@/utils/server/supabase';
import {
    getLocalCharacterList,
    getLocalOpenAiKey,
    getLocalThreadList,
} from '@/utils/client/localstorage';
import { useUI } from './UIProvider';
import initialState from './initialChat';
import Dialogs from '@/components/Dialogs';
import { mergeThreads, mergeCharacters } from '@/utils';
import { useSave } from '@/lib/useSave';
import { getTitle } from '@/utils/client';

const ChatContext = createContext<ChatState>(initialState);

export const useChat = () => useContext(ChatContext);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const search = useSearchParams();
    const threadId = search.get('c');
    const plausible = usePlausible();
    const { data: session } = useSession();
    const userId = session?.user?.email;
    const router = useRouter();

    const { setAppSettingsOpen } = useUI();

    const [mounted, setMounted] = useState(false);
    const [state, setState] = useState<ChatState>(initialState);

    const activeThread = useMemo(() => {
        if (state.currentThreadIdx !== null) {
            return state.threads[state.currentThreadIdx];
        }
    }, [state.currentThreadIdx, state.threads]);

    const { saveAgentConfig, saveChatThread, saveMessages } = useSave(
        userId,
        state,
        setState,
    );

    const createThread = createThreadHandler(state, setState, router);
    const setOpenAiApiKey = setOpenAiApiKeyHandler(setState);
    const abortRequest = abortRequestHandler(state, setState);

    // Load data
    useEffect(() => {
        if (mounted) return;
        // Load OpenAI API key from local storage
        const key = getLocalOpenAiKey();
        if (key) setOpenAiApiKey(key);

        const fetchDataAndMerge = async () => {
            // Load threads and characters from local storage
            const localCharacters = getLocalCharacterList();
            const localThreads = getLocalThreadList();

            let serverCharacters: AgentConfig[] = [];
            let serverThreads: ChatThread[] = [];

            if (userId) {
                // Fetch server data
                [serverThreads, serverCharacters] = await Promise.all([
                    getThreadListByUserId(userId),
                    getCharacterListByUserId(userId),
                ]);
            }

            const mergedThreads = mergeThreads(
                mergeThreads(state.threads, localThreads),
                serverThreads,
            );
            const mergedCharacters = mergeCharacters(
                mergeCharacters(state.characterList, localCharacters),
                serverCharacters,
            );

            setState((prevState) => ({
                ...prevState,
                threads: mergedThreads,
                characterList: mergedCharacters,
            }));
            setMounted(true);
        };

        fetchDataAndMerge();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    // Save thread when it is updated
    useEffect(() => {
        if (!activeThread) return;
        const saveChat = async () => {
            if (!state.saved.agentConfig)
                await saveAgentConfig(activeThread.agentConfig);
            if (!state.saved.thread) await saveChatThread(activeThread);
            if (!state.saved.messages && !state.botTyping) {
                await saveMessages(activeThread);
            }
        };
        saveChat();
    }, [
        activeThread,
        saveAgentConfig,
        saveChatThread,
        saveMessages,
        state.botTyping,
        state.currentThreadIdx,
        state.saved.agentConfig,
        state.saved.messages,
        state.saved.thread,
        state.threads,
    ]);

    useEffect(() => {
        if (!activeThread) return;
        if (state.botTyping) return;
        const upsertTitle = (title: string) => {
            document.title = 'Chat | ' + title;
            setState((p) => upsertTitleState(p, title));
        };

        getTitle(activeThread, upsertTitle, userId, state.openAiApiKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.botTyping]);

    // Update active thread when threadId changes
    useEffect(() => {
        if (!threadId) return;
        setState((prevState) => {
            const foundThreadIndex = prevState.threads.findIndex(
                (t) => t.id === threadId,
            );

            if (foundThreadIndex === -1) return prevState;

            return foundThreadIndex === -1
                ? prevState
                : {
                      ...prevState,
                      input: '',
                      currentThreadIdx: foundThreadIndex,
                  };
        });
    }, [threadId, state.threads]);

    const value: ChatState = {
        ...state,
        activeThread,
        abortRequest,
        createThread,
        setOpenAiApiKey,
        clearChat: clearChatHandler(setState),
        addMessage: addMessageHandler(setState, router),
        cancelEdit: cancelEditHandler(setState),
        changeInput: changeInputHandler(setState),
        changeBranch: changeBranchHandler(setState),
        removeThread: removeThreadHandler(setState),
        saveCharacter: saveCharacterHandler(setState),
        removeMessage: removeMessageHandler(setState),
        editMessage: editMessageHandler(setState),
        toggleplugin: togglePluginHandler(setState),
        setSystemMessage: setSystemMessageHandler(setState),
        setStreamResponse: setStreamResponseHandler(setState),
        setPluginsEnabled: setPluginsEnabledHandler(setState),
        updateThreadConfig: updateThreadConfigHandler(setState),
        regenerateChat: regenerateChatHandler(setState, state),
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
