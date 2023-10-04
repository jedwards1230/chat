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
    return (
        <div>
            <div className="flex gap-2">
                <div>{threads.length} Chats</div>|
                <div>
                    {threads.reduce(
                        (acc, thread) =>
                            acc +
                            ChatManager.getOrderedMessages(
                                thread.currentNode,
                                thread.mapping,
                            ).length,
                        0,
                    )}{' '}
                    Messages
                </div>
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
        <div className="flex flex-1 flex-col justify-between">
            <DialogHeader>Local Data</DialogHeader>

            <label className="flex w-full items-center justify-between py-2 text-base">
                <button
                    onClick={clearAllLocalChatThreads}
                    className="w-full rounded border border-red-500 px-2 py-1.5 hover:bg-red-600 hover:text-neutral-50 dark:border-red-500/80 dark:text-neutral-50 dark:hover:bg-red-700"
                >
                    Clear Local Chat Threads
                </button>
            </label>
            <label className="flex w-full items-center justify-between py-2 text-base">
                <button
                    onClick={clearAllLocalCharacters}
                    className="w-full rounded border border-red-500 px-2 py-1.5 hover:bg-red-600 hover:text-neutral-50 dark:border-red-500/80 dark:text-neutral-50 dark:hover:bg-red-700"
                >
                    Clear Local Characters
                </button>
            </label>
            <label className="flex w-full items-center justify-between py-2 text-base">
                <button
                    onClick={clearAllLocal}
                    className="w-full rounded bg-red-500 px-2 py-1.5 text-neutral-50 hover:bg-red-600 dark:bg-red-500/80 dark:hover:bg-red-700"
                >
                    Clear Local Data
                </button>
            </label>
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
        <div className="flex flex-1 flex-col justify-between">
            <DialogHeader>Cloud Data</DialogHeader>
            <label className="flex w-full items-center justify-between py-2 text-base">
                <button
                    onClick={clearAllCloudChatThreads}
                    className="w-full rounded border border-red-500 px-2 py-1.5 hover:bg-red-600 hover:text-neutral-50 dark:border-red-500/80 dark:text-neutral-50 dark:hover:bg-red-700"
                >
                    Clear Cloud Chat Threads
                </button>
            </label>
            <label className="flex w-full items-center justify-between py-2 text-base">
                <button
                    onClick={clearAllCloudCharacters}
                    className="w-full rounded border border-red-500 px-2 py-1.5 hover:bg-red-600 hover:text-neutral-50 dark:border-red-500/80 dark:text-neutral-50 dark:hover:bg-red-700"
                >
                    Clear Cloud Characters
                </button>
            </label>
            <label className="flex w-full items-center justify-between py-2 text-base">
                <button
                    onClick={clearAllCloud}
                    className="w-full rounded bg-red-500 px-2 py-1.5 text-neutral-50 hover:bg-red-600 dark:bg-red-500/80 dark:hover:bg-red-700"
                >
                    Clear Cloud Data
                </button>
            </label>
        </div>
    );
}
