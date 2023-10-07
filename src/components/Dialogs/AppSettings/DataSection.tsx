import { Button } from '@/components/ui/button';
import { DialogHeader } from '@/components/ui/dialog';
import ChatManager from '@/lib/ChatManager';
import { useChat } from '@/providers/ChatProvider';
import {
    deleteAllLocalThreadList,
    deleteAllLocalCharacterList,
} from '@/utils/client/localstorage';
import { deleteAllThreads, deleteAllCharacters } from '@/utils/server/supabase';

export default function DataSection({ user }: { user?: User }) {
    return (
        <>
            <DialogHeader>Data</DialogHeader>
            <GeneralData />
            <div className="flex w-full flex-wrap gap-4 whitespace-nowrap">
                <LocalData />
                {user && <CloudData />}
            </div>
        </>
    );
}

function GeneralData() {
    const { threads, characterList } = useChat();

    const threadList = threads.filter((t) => {
        const list = ChatManager.getOrderedMessages(t.currentNode, t.mapping);
        return list.length > 1;
    });

    const messages = threadList.reduce((acc, thread) => {
        const list = ChatManager.getOrderedMessages(
            thread.currentNode,
            thread.mapping,
        );
        return acc + list.length;
    }, 0);

    return (
        <div>
            <div className="flex gap-2">
                <div>{threads.length} Chats</div>|<div>{messages} Messages</div>
                |
                <div>
                    {characterList.length}{' '}
                    {characterList.length === 1 ? 'Character' : 'Characters'}
                </div>
            </div>
        </div>
    );
}

function LocalData() {
    const { removeAllThreads } = useChat();

    const clearAllLocalChatThreads = () => {
        deleteAllLocalThreadList();
        removeAllThreads();
    };

    const clearAllLocalCharacters = () => {
        deleteAllLocalCharacterList();
    };

    const clearAllLocal = () => {
        deleteAllLocalThreadList();
        deleteAllLocalCharacterList();
        removeAllThreads();
    };

    return (
        <div className="flex flex-1 flex-col justify-between gap-2">
            <DialogHeader>Local Data</DialogHeader>

            <Button
                variant="outlineDestructive"
                onClick={clearAllLocalChatThreads}
            >
                Clear Local Chat Threads
            </Button>
            <Button
                variant="outlineDestructive"
                onClick={clearAllLocalCharacters}
            >
                Clear Local Characters
            </Button>
            <Button variant="destructive" onClick={clearAllLocal}>
                Clear Local Characters
            </Button>
        </div>
    );
}

function CloudData() {
    const { removeAllThreads } = useChat();

    const clearAllCloudChatThreads = async () => {
        await deleteAllThreads();
        removeAllThreads();
    };

    const clearAllCloudCharacters = async () => {
        await deleteAllCharacters();
    };

    const clearAllCloud = async () => {
        await deleteAllThreads();
        await deleteAllCharacters();
        removeAllThreads();
    };

    return (
        <div className="flex flex-1 flex-col justify-between gap-2">
            <DialogHeader>Cloud Data</DialogHeader>
            <Button
                variant="outlineDestructive"
                onClick={clearAllCloudChatThreads}
            >
                Clear Cloud Chat Threads
            </Button>
            <Button
                variant="outlineDestructive"
                onClick={clearAllCloudCharacters}
            >
                Clear Cloud Characters
            </Button>
            <Button variant="destructive" onClick={clearAllCloud}>
                Clear Cloud Data
            </Button>
        </div>
    );
}
