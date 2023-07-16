'use client';

import Dialog from './Dialog';
import { useChat, useChatDispatch } from '@/providers/ChatProvider';
import { Select } from '../Forms';
import { useAuth } from '@clerk/nextjs';

export default function ConfigEditor() {
    const { threadList, configEditorOpen, config } = useChat();
    const { signOut, userId } = useAuth();
    const dispatch = useChatDispatch();

    const clearAll = () => {
        dispatch({ type: 'CLEAR_HISTORY' });
        dispatch({ type: 'CREATE_THREAD' });
    };

    if (!configEditorOpen) return null;
    return (
        <Dialog
            callback={() =>
                dispatch({
                    type: 'SET_CONFIG_EDITOR_OPEN',
                    payload: false,
                })
            }
        >
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
                    onChange={(e) => {
                        dispatch({
                            type: 'UPDATE_CONFIG',
                            payload: {
                                ...config,
                                model: e.target.value as Model,
                            },
                        });
                    }}
                />

                {/* Credentials */}
                <div>
                    <div className="text-xl font-medium">Credentials</div>
                    <div className="flex w-full justify-between gap-2 py-2">
                        <span>User ID:</span>
                        {userId}
                    </div>
                    <button
                        className="roudned-lg w-full border border-red-500 py-2 text-center hover:bg-red-500/80"
                        onClick={() => {
                            dispatch({
                                type: 'SET_CONFIG_EDITOR_OPEN',
                                payload: false,
                            });
                            signOut();
                        }}
                    >
                        Sign Out
                    </button>
                </div>

                {/* Data */}
                <div>
                    <div className="text-xl font-medium">Data</div>
                    <div className="flex gap-2">
                        <div>{threadList.length} Chats</div>|
                        <div>
                            {threadList.reduce(
                                (acc, thread) => acc + thread.messages.length,
                                0,
                            )}{' '}
                            Messages
                        </div>
                    </div>
                    <label className="flex w-full items-center justify-between py-2 text-base">
                        <button
                            onClick={clearAll}
                            className="w-full rounded bg-red-500 py-1.5 text-neutral-50 hover:bg-red-600 dark:bg-red-500/80 dark:hover:bg-red-700"
                        >
                            Clear Local Storage
                        </button>
                    </label>
                </div>
            </div>
        </Dialog>
    );
}
