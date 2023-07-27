'use client';

import Image from 'next/image';
import { useAuth, useUser } from '@clerk/nextjs';

import Dialog from './Dialog';
import { useChat } from '@/providers/ChatProvider';
import { Select } from '../Forms';
import { deleteAllCloudThreads } from '@/utils/server/server';
import { useUI } from '@/providers/UIProvider';

export default function ConfigEditor() {
    const { config, setConfig, removeAllThreads } = useChat();
    const { configEditorOpen, setConfigEditorOpen } = useUI();
    const { signOut } = useAuth();
    const { user } = useUser();

    const closeConfigEditor = () => {
        setConfigEditorOpen(false);
    };

    const clearAllCloud = async () => {
        await deleteAllCloudThreads();
        removeAllThreads();
        closeConfigEditor();
    };

    if (!configEditorOpen || !user) return null;
    return (
        <Dialog callback={closeConfigEditor}>
            <div className="w-full pb-4 text-center text-xl font-semibold">
                App Settings
            </div>

            <div className="flex flex-col gap-4">
                {/* Default Model */}
                <Select
                    label="Default Model"
                    value={config.model}
                    options={[
                        { label: 'gpt-3.5-turbo', value: 'gpt-3.5-turbo' },
                        {
                            label: 'gpt-3.5-turbo-16k',
                            value: 'gpt-3.5-turbo-16k',
                        },
                        { label: 'gpt-4', value: 'gpt-4' },
                        { label: 'gpt-4-0613', value: 'gpt-4-0613' },
                    ]}
                    onChange={(e) =>
                        setConfig({
                            ...config,
                            model: e.target.value as Model,
                        })
                    }
                />

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
                        className="roudned-lg w-full border border-red-500 py-2 text-center hover:bg-red-500/80"
                        onClick={() => signOut()}
                    >
                        Sign Out
                    </button>
                </div>

                {/* Data */}
                <div>
                    <div className="text-xl font-medium">Data</div>
                    {/* TODO: count messages */}
                    {/* <div className="flex gap-2">
                        <div>{threadList.length} Chats</div>|
                        <div>
                            {threadList.reduce(
                                (acc, thread) => acc + thread.messages.length,
                                0,
                            )}{' '}
                            Messages
                        </div>
                    </div> */}
                    {/* <label className="flex w-full items-center justify-between py-2 text-base">
                        <button
                            onClick={clearAllLocal}
                            className="w-full rounded bg-red-500 py-1.5 text-neutral-50 hover:bg-red-600 dark:bg-red-500/80 dark:hover:bg-red-700"
                        >
                            Clear Local Storage
                        </button>
                    </label> */}
                    <label className="flex w-full items-center justify-between py-2 text-base">
                        <button
                            onClick={clearAllCloud}
                            className="w-full rounded bg-red-500 py-1.5 text-neutral-50 hover:bg-red-600 dark:bg-red-500/80 dark:hover:bg-red-700"
                        >
                            Clear Cloud Storage
                        </button>
                    </label>
                </div>
            </div>
        </Dialog>
    );
}
