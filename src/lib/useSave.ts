// useSave.tsx

import { useCallback } from 'react';
import {
    upsertAgentConfig,
    upsertMessages,
    upsertThread,
} from '@/utils/server/supabase';
import { setLocalThreadList } from '@/utils/client/localstorage';

export const useSave = (
    userId: string | null | undefined,
    state: ChatState,
    setState: React.Dispatch<React.SetStateAction<ChatState>>,
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

    return { saveAgentConfig, saveChatThread, saveMessages };
};
