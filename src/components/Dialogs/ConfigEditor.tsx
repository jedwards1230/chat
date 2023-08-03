'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuth, useUser } from '@clerk/nextjs';

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
    const {
        removeAllThreads,
        threads,
        characterList,
        openAiApiKey,
        setOpenAiApiKey,
    } = useChat();
    const { setConfigEditorOpen } = useUI();
    const { signOut } = useAuth();
    const { user } = useUser();
    const [apiKey, setApiKey] = useState(openAiApiKey || '');
    const [apiError, setApiError] = useState<string | null>(null);
    const [validating, setValidating] = useState(false);

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

    const clearAllLocalChatThreads = () => {
        deleteAllLocalThreadList();
        removeAllThreads();
        closeConfigEditor();
    };

    const clearAllLocalCharacters = () => {
        deleteAllLocalCharacterList();
        closeConfigEditor();
    };

    const clearAllLocal = () => {
        deleteAllLocalThreadList();
        deleteAllLocalCharacterList();
        removeAllThreads();
        closeConfigEditor();
    };

    const clearAllCloudChatThreads = async () => {
        await deleteAllThreads();
        removeAllThreads();
        closeConfigEditor();
    };

    const clearAllCloudCharacters = async () => {
        await deleteAllCharacters();
        closeConfigEditor();
    };

    const clearAllCloud = async () => {
        await deleteAllThreads();
        await deleteAllCharacters();
        removeAllThreads();
        closeConfigEditor();
    };

    return (
        <Dialog callback={closeConfigEditor}>
            <div className="w-full pb-4 text-center text-xl font-semibold">
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
                                <div className="flex w-full items-center justify-between pb-4 pt-2">
                                    <div className="flex w-full flex-col gap-0 overflow-x-scroll">
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
                                    className="w-full rounded border border-red-500 py-2 text-center hover:bg-red-600 hover:text-neutral-50"
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
                                className="scale-90 rounded bg-red-500 p-1 text-neutral-50 transition-colors hover:bg-red-600 disabled:bg-neutral-500"
                            >
                                <XMark />
                            </button>
                            <button
                                type="submit"
                                title="Save"
                                disabled={validating}
                                className="scale-90 rounded bg-green-500 p-1 text-neutral-50 transition-colors hover:bg-green-600 disabled:bg-neutral-500"
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

                {/* Data */}
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
                            {characterList.length === 1
                                ? 'Character'
                                : 'Characters'}
                        </div>
                    </div>
                </div>

                {/* Local Data */}
                <div>
                    <div className="text-xl font-medium">Local Data</div>

                    <label className="flex w-full items-center justify-between py-2 text-base">
                        <button
                            onClick={clearAllLocalChatThreads}
                            className="w-full rounded border border-red-500 py-1.5 hover:bg-red-600 hover:text-neutral-50 dark:border-red-500/80 dark:text-neutral-50 dark:hover:bg-red-700"
                        >
                            Clear ALL Local Chat Threads
                        </button>
                    </label>
                    <label className="flex w-full items-center justify-between py-2 text-base">
                        <button
                            onClick={clearAllLocalCharacters}
                            className="w-full rounded border border-red-500 py-1.5 hover:bg-red-600 hover:text-neutral-50 dark:border-red-500/80 dark:text-neutral-50 dark:hover:bg-red-700"
                        >
                            Clear ALL Local Characters
                        </button>
                    </label>
                    <label className="flex w-full items-center justify-between py-2 text-base">
                        <button
                            onClick={clearAllLocal}
                            className="w-full rounded bg-red-500 py-1.5 text-neutral-50 hover:bg-red-600 dark:bg-red-500/80 dark:hover:bg-red-700"
                        >
                            Clear ALL Local Data
                        </button>
                    </label>
                </div>

                {/* Cloud Data */}
                {user && (
                    <div>
                        <div className="text-xl font-medium">Cloud Data</div>
                        <label className="flex w-full items-center justify-between py-2 text-base">
                            <button
                                onClick={clearAllCloudChatThreads}
                                className="w-full rounded border border-red-500 py-1.5 hover:bg-red-600 hover:text-neutral-50 dark:border-red-500/80 dark:text-neutral-50 dark:hover:bg-red-700"
                            >
                                Clear ALL Cloud Chat Threads
                            </button>
                        </label>
                        <label className="flex w-full items-center justify-between py-2 text-base">
                            <button
                                onClick={clearAllCloudCharacters}
                                className="w-full rounded border border-red-500 py-1.5 hover:bg-red-600 hover:text-neutral-50 dark:border-red-500/80 dark:text-neutral-50 dark:hover:bg-red-700"
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
                )}
            </div>
        </Dialog>
    );
}
