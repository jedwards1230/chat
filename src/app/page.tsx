'use client';

import Chat from '@/components/Chat';
import { ChatProvider } from '@/providers/ChatProvider';
import {
    getUserId,
    getThreadListByUserId,
    getCharacterListByUserId,
} from '@/utils/server/supabase';
import { useEffect, useState } from 'react';

export default function Page() {
    const [userId, setUserId] = useState<string | undefined>();
    const [threads, setThreads] = useState<ChatThread[]>([]);
    const [characterList, setCharacterList] = useState<AgentConfig[]>([]);

    useEffect(() => {
        getUserId(true).then(setUserId);

        Promise.all([
            getThreadListByUserId(userId),
            getCharacterListByUserId(userId),
        ]).then(([threads, characterList]) => {
            setThreads(threads);
            setCharacterList(characterList);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <ChatProvider threadList={threads} characterList={characterList}>
            <Chat />
        </ChatProvider>
    );
}
