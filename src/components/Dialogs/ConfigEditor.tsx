'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';

import Dialog from './Dialog';
import Input from '../Forms/Input';
import { Check, XMark } from '../Icons';
import { useChat } from '@/providers/ChatProvider';
import { useUI } from '@/providers/UIProvider';
import { deleteAllThreads, deleteAllCharacters } from '@/utils/server/supabase';
import { validateOpenAIKey } from '@/utils/client/client';
import {
    deleteAllLocalCharacterList,
    deleteAllLocalThreadList,
    deleteLocalOpenAiKey,
    setLocalOpenAiKey,
} from '@/utils/client/storage';

export default function ConfigEditor() {
    const { openAiApiKey, setOpenAiApiKey } = useChat();
    const { setConfigEditorOpen } = useUI();
    const { data: session } = useSession();
    const user = session?.user;
    const [apiKey, setApiKey] = useState(openAiApiKey || '');
    const [apiError, setApiError] = useState<string | null>(null);
    const [validating, setValidating] = useState(false);

    console.log(session);

    const closeConfigEditor = () => {
        setConfigEditorOpen(false);
    };

    const updateOpenAipiKey = async (key: string) => {
        setValidating(true);
        try {
            await validateOpenAIKey(key);
            setApiError(null);
            setApiKey(key);
            setLocalOpenAiKey(key);
            close();
        } catch (err: any) {
            setApiError(err.message);
        }
        setValidating(false);
    };

    const handleOpenAiApiKeySubmit = async (
        e: React.FormEvent<HTMLFormElement>,
    ) => {
        e.preventDefault();
        await updateOpenAipiKey(apiKey);
    };

    return (
        <Dialog callback={closeConfigEditor} size="lg">
            <div className="w-full pb-4 text-xl font-semibold text-center">
                App Settings
            </div>

            <div className="flex flex-col gap-4">
                {/* Credentials */}
                <div className="flex flex-col gap-4">
                    <div>
                        <div className="text-xl font-medium">Credentials</div>

                        {user && (
                            <>
                                <div className="font-medium">Cloud Auth</div>
                                <div className="flex items-center justify-between w-full pt-2 pb-4">
                                    <div className="flex flex-col w-full gap-0 overflow-x-scroll">
                                        <div>{user.name}</div>
                                        <div>{user.email}</div>
                                    </div>
                                    <Image
                                        src={user.image || ''}
                                        alt="You"
                                        width={64}
                                        height={64}
                                        className="border rounded"
                                    />
                                </div>

                                <button
                                    className="w-full py-2 text-center border border-red-500 rounded hover:bg-red-600 hover:text-neutral-50"
                                    onClick={() => signOut()}
                                >
                                    Sign Out
                                </button>
                            </>
                        )}
                    </div>
                    <form onSubmit={handleOpenAiApiKeySubmit}>
                        <div className="font-medium">OpenAI Api Key</div>
                        <div className="flex w-full gap-2 pt-2">
                            <Input
                                className="w-full p-1 dark:border-neutral-600 dark:focus:border-neutral-400"
                                value={apiKey}
                                type={apiError ? 'text' : 'password'}
                                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                onChange={(e) => setApiKey(e.target.value)}
                            />
                            <button
                                onClick={() => {
                                    setApiKey('');
                                    deleteLocalOpenAiKey();
                                    setOpenAiApiKey();
                                }}
                                title="Delete"
                                disabled={validating}
                                className="p-1 transition-colors scale-90 bg-red-500 rounded text-neutral-50 hover:bg-red-600 disabled:bg-neutral-500"
                            >
                                <XMark />
                            </button>
                            <button
                                type="submit"
                                title="Save"
                                disabled={validating}
                                className="p-1 transition-colors scale-90 bg-green-500 rounded text-neutral-50 hover:bg-green-600 disabled:bg-neutral-500"
                            >
                                <Check />
                            </button>
                        </div>
                        {apiError && (
                            <div className="text-sm text-red-500">
                                {apiError}
                            </div>
                        )}
                    </form>
                </div>

                <GeneralData />
                <div className="flex flex-wrap w-full gap-4 whitespace-nowrap">
                    <LocalData />
                    {user && <CloudData />}
                </div>
            </div>
        </Dialog>
    );
}

function GeneralData() {
    const { threads, characterList } = useChat();
    return (
        <div>
            <div className="text-xl font-medium">Data</div>

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
                    {characterList.length === 1 ? 'Character' : 'Characters'}
                </div>
            </div>
        </div>
    );
}

function LocalData() {
    const { removeAllThreads } = useChat();
    const { setConfigEditorOpen } = useUI();

    const clearAllLocalChatThreads = () => {
        deleteAllLocalThreadList();
        removeAllThreads();
        setConfigEditorOpen(false);
    };

    const clearAllLocalCharacters = () => {
        deleteAllLocalCharacterList();
        setConfigEditorOpen(false);
    };

    const clearAllLocal = () => {
        deleteAllLocalThreadList();
        deleteAllLocalCharacterList();
        removeAllThreads();
        setConfigEditorOpen(false);
    };

    return (
        <div className="flex flex-col justify-between flex-1">
            <div className="text-xl font-medium">Local Data</div>

            <label className="flex items-center justify-between w-full py-2 text-base">
                <button
                    onClick={clearAllLocalChatThreads}
                    className="w-full rounded border border-red-500 px-2 py-1.5 hover:bg-red-600 hover:text-neutral-50 dark:border-red-500/80 dark:text-neutral-50 dark:hover:bg-red-700"
                >
                    Clear Local Chat Threads
                </button>
            </label>
            <label className="flex items-center justify-between w-full py-2 text-base">
                <button
                    onClick={clearAllLocalCharacters}
                    className="w-full rounded border border-red-500 px-2 py-1.5 hover:bg-red-600 hover:text-neutral-50 dark:border-red-500/80 dark:text-neutral-50 dark:hover:bg-red-700"
                >
                    Clear Local Characters
                </button>
            </label>
            <label className="flex items-center justify-between w-full py-2 text-base">
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
    const { setConfigEditorOpen } = useUI();

    const clearAllCloudChatThreads = async () => {
        await deleteAllThreads();
        removeAllThreads();
        setConfigEditorOpen(false);
    };

    const clearAllCloudCharacters = async () => {
        await deleteAllCharacters();
        setConfigEditorOpen(false);
    };

    const clearAllCloud = async () => {
        await deleteAllThreads();
        await deleteAllCharacters();
        removeAllThreads();
        setConfigEditorOpen(false);
    };

    return (
        <div className="flex flex-col justify-between flex-1">
            <div className="text-xl font-medium">Cloud Data</div>
            <label className="flex items-center justify-between w-full py-2 text-base">
                <button
                    onClick={clearAllCloudChatThreads}
                    className="w-full rounded border border-red-500 px-2 py-1.5 hover:bg-red-600 hover:text-neutral-50 dark:border-red-500/80 dark:text-neutral-50 dark:hover:bg-red-700"
                >
                    Clear Cloud Chat Threads
                </button>
            </label>
            <label className="flex items-center justify-between w-full py-2 text-base">
                <button
                    onClick={clearAllCloudCharacters}
                    className="w-full rounded border border-red-500 px-2 py-1.5 hover:bg-red-600 hover:text-neutral-50 dark:border-red-500/80 dark:text-neutral-50 dark:hover:bg-red-700"
                >
                    Clear Cloud Characters
                </button>
            </label>
            <label className="flex items-center justify-between w-full py-2 text-base">
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
