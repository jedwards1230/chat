'use client';

import Image from 'next/image';
import { useAuth, useUser } from '@clerk/nextjs';

import { useChat } from '@/providers/ChatProvider';
import { useUI } from '@/providers/UIProvider';
import { deleteAllCloudThreads, deleteAllDBCharacters } from '@/utils/server';
import Dialog from './Dialog';

export default function ConfigEditor() {
    const { removeAllThreads, threads, characterList } = useChat();
    const { setConfigEditorOpen } = useUI();
    const { signOut } = useAuth();
    const { user } = useUser();

    const closeConfigEditor = () => {
        setConfigEditorOpen(false);
    };

    const clearAllChatThreads = async () => {
        await deleteAllCloudThreads();
        removeAllThreads();
        closeConfigEditor();
    };

    const clearAllCharacters = async () => {
        await deleteAllDBCharacters();
        closeConfigEditor();
    };

    const clearAllCloud = async () => {
        await deleteAllCloudThreads();
        await deleteAllDBCharacters();
        removeAllThreads();
        closeConfigEditor();
    };

    if (!user) return null;
    return (
        <Dialog callback={closeConfigEditor}>
            <div className="w-full pb-4 text-center text-xl font-semibold">
                App Settings
            </div>

            <div className="flex flex-col gap-4">
                {/* Credentials */}
                <div>
                    <div className="text-xl font-medium">Credentials</div>
                    <div className="flex w-full items-center justify-between pb-4 pt-2">
                        <div className="flex w-full flex-col gap-0">
                            <div>{user.firstName}</div>
                            <div>{user.id}</div>
                        </div>
                        <Image
                            src={user.profileImageUrl}
                            alt="You"
                            width={64}
                            height={64}
                            className="rounded border"
                        />
                    </div>

                    <button
                        className="w-full rounded border border-red-500 py-2 text-center hover:bg-red-700"
                        onClick={() => signOut()}
                    >
                        Sign Out
                    </button>
                </div>

                {/* Data */}
                <div>
                    <div className="text-xl font-medium">Data</div>
                    {/* TODO: count messages */}
                    <div className="flex gap-2">
                        <div>{threads.length} Chats</div>|
                        <div>
                            {threads.reduce(
                                (acc, thread) => acc + thread.messages.length,
                                0,
                            )}{' '}
                            Messages
                        </div>
                        |
                        <div>
                            {characterList.length}{' '}
                            {characterList.length === 1
                                ? 'Character'
                                : 'Characters'}
                        </div>
                    </div>
                    <label className="flex w-full items-center justify-between py-2 text-base">
                        <button
                            onClick={clearAllChatThreads}
                            className="w-full rounded border border-red-500 py-1.5 text-neutral-50 hover:bg-red-600 dark:border-red-500/80 dark:hover:bg-red-700"
                        >
                            Clear ALL Cloud Chat Threads
                        </button>
                    </label>
                    <label className="flex w-full items-center justify-between py-2 text-base">
                        <button
                            onClick={clearAllCharacters}
                            className="w-full rounded border border-red-500 py-1.5 text-neutral-50 hover:bg-red-600 dark:border-red-500/80 dark:hover:bg-red-700"
                        >
                            Clear ALL Cloud Characters
                        </button>
                    </label>
                    <label className="flex w-full items-center justify-between py-2 text-base">
                        <button
                            onClick={clearAllCloud}
                            className="w-full rounded bg-red-500 py-1.5 text-neutral-50 hover:bg-red-600 dark:bg-red-500/80 dark:hover:bg-red-700"
                        >
                            Clear ALL Cloud Data
                        </button>
                    </label>
                </div>
            </div>
        </Dialog>
    );
}
