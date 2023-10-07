import Chat from '@/components/Chat';
import { ChatProvider } from '@/providers/ChatProvider';
import {
    getUserId,
    getThreadListByUserId,
    getCharacterListByUserId,
} from '@/utils/server/supabase';

export default async function Page({
    searchParams,
}: {
    searchParams?: { c?: string };
}) {
    const userId = await getUserId(true);

    const [threads, characterList] = await Promise.all([
        getThreadListByUserId(userId),
        getCharacterListByUserId(userId),
    ]);

    return (
        <ChatProvider
            threadList={threads}
            characterList={characterList}
            threadId={searchParams?.c}
        >
            <Chat />
        </ChatProvider>
    );
}
