// useSave.tsx

import { useCallback, useEffect, useState } from 'react';
import {
    getCharacterListByUserId,
    getThreadListByUserId,
    upsertAgentConfig,
    upsertMessages,
    upsertThread,
} from '@/utils/server/supabase';
import {
    getLocalCharacterList,
    getLocalOpenAiKey,
    getLocalThreadList,
    setLocalThreadList,
} from '@/utils/client/localstorage';
import { mergeThreads, mergeCharacters } from '@/utils';

export const useSave = (
    userId: string | null | undefined,
    state: ChatState,
    setState: React.Dispatch<React.SetStateAction<ChatState>>,
    setOpenAiApiKey: (openAiApiKey?: string | undefined) => void,
) => {
    const saveAgentConfig = useCallback(
        async (agentConfig: AgentConfig) => {
            try {
                if (userId) {
                    await upsertAgentConfig(agentConfig);
                }
                if (typeof window !== 'undefined') {
                    setLocalThreadList(state.threads);
                }
                setState((prevState) => ({
                    ...prevState,
                    saved: {
                        ...prevState.saved,
                        agentConfig: true,
                    },
                }));
            } catch (err) {
                console.error(err);
            }
        },
        [state.threads, userId, setState],
    );

    const saveChatThread = useCallback(
        async (thread: ChatThread) => {
            try {
                if (userId) {
                    await upsertThread(thread);
                }
                if (typeof window !== 'undefined') {
                    setLocalThreadList(state.threads);
                }
                setState((prevState) => ({
                    ...prevState,
                    saved: {
                        ...prevState.saved,
                        thread: true,
                    },
                }));
            } catch (err) {
                console.error(err);
            }
        },
        [state.threads, userId, setState],
    );

    const saveMessages = useCallback(
        async (thread: ChatThread) => {
            try {
                if (userId) {
                    await upsertMessages(thread);
                }
                if (typeof window !== 'undefined') {
                    setLocalThreadList(state.threads);
                }
                setState((prevState) => ({
                    ...prevState,
                    saved: {
                        ...prevState.saved,
                        messages: true,
                    },
                }));
            } catch (err) {
                console.error(err);
            }
        },
        [state.threads, userId, setState],
    );

    // Load data
    useEffect(() => {
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
                try {
                    // Fetch server data
                    [serverThreads, serverCharacters] = await Promise.all([
                        getThreadListByUserId(userId),
                        getCharacterListByUserId(userId),
                    ]);
                } catch (e) {
                    console.error(e);
                }
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
        };

        fetchDataAndMerge();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    return { saveAgentConfig, saveChatThread, saveMessages };
};
