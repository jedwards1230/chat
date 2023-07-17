'use client';

import {
    Dispatch,
    createContext,
    useContext,
    useEffect,
    useReducer,
    useState,
} from 'react';

import { isMobile as iM } from '@/utils/client';
import { chatReducer } from '@/providers/chatReducer';
import initialState from './initialChat';
import { saveCloudHistory } from '@/utils/server';
import { serializeSaveData } from '@/utils';

const ChatContext = createContext<ChatState>(initialState);
const ChatDispatchContext = createContext<Dispatch<ChatAction>>(() => {});

export const useChat = () => useContext(ChatContext);
export const useChatDispatch = () => useContext(ChatDispatchContext);

export function ChatProvider({
    children,
    history,
}: {
    children: React.ReactNode;
    history: SaveData | null;
}) {
    const [checkedLocal, setCheckedLocal] = useState(false);
    const [isMobile, setIsMobile] = useState(iM('md') || false);

    const [state, dispatch] = useReducer(chatReducer, {
        ...initialState,
        config: history ? history.config : initialState.config,
        threadList: history ? history.chatHistory : initialState.threadList,
        sideBarOpen: !isMobile,
    });

    // Effect to check stored chat history on component mount
    useEffect(() => {
        if (typeof window === 'undefined') return;

        if (!history) {
            const storedThreads = localStorage.getItem('chatHistory');
            if (storedThreads) {
                const saveData: SaveData = JSON.parse(storedThreads);
                dispatch({
                    type: 'INITIALIZE',
                    payload: saveData,
                });
            }
        }
        setCheckedLocal(true);

        // responsive sidebar
        const handleResize = () => {
            if (isMobile && !iM('md')) {
                dispatch({
                    type: 'SET_SIDEBAR_OPEN',
                    payload: false,
                });
                setIsMobile(true);
            } else if (!iM('md')) {
                dispatch({
                    type: 'SET_SIDEBAR_OPEN',
                    payload: true,
                });
                setIsMobile(false);
            } else {
                dispatch({
                    type: 'SET_SIDEBAR_OPEN',
                    payload: false,
                });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            // ensure that any pending requests are cancelled
            state.abortController?.abort();
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const saveHistory = async (saveData: SaveData) => {
        try {
            localStorage.setItem('chatHistory', serializeSaveData(saveData));
            await saveCloudHistory(saveData);
        } catch (error) {
            console.error(error);
        }
    };

    // Effect to sync local storage with the chat thread list
    useEffect(() => {
        if (typeof window !== 'undefined' && checkedLocal && !state.botTyping) {
            saveHistory({
                config: state.config,
                chatHistory: state.threadList,
            });
        }
    }, [checkedLocal, state.botTyping, state.config, state.threadList]);

    if (!checkedLocal) return null;
    return (
        <ChatContext.Provider value={state}>
            <ChatDispatchContext.Provider value={dispatch}>
                {children}
            </ChatDispatchContext.Provider>
        </ChatContext.Provider>
    );
}
