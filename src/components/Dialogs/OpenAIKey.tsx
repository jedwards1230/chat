import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';

import Dialog from './Dialog';
import { useUI } from '@/providers/UIProvider';
import { useChat } from '@/providers/ChatProvider';
import Input from '../Forms/Input';
import { useState } from 'react';
import { Check, XMark } from '../Icons';
import { validateOpenAIKey } from '@/utils/client/client';
import {
    deleteLocalOpenAiKey,
    setLocalOpenAiKey,
} from '@/utils/client/storage';
import { usePlausible } from 'next-plausible';

export default function OpenAIKey() {
    const { setOpenAIKeyOpen } = useUI();

    const close = () => {
        setOpenAIKeyOpen(false);
    };

    return (
        <Dialog callback={close} size="lg">
            <div className="flex flex-col items-center gap-2">
                <div className="text-xl">
                    An OpenAI API key is required to use this application.
                </div>
                <div>
                    <div>Your key can be used in 3 ways:</div>
                    <ul className="w-full list-inside pl-4">
                        <li>
                            <strong>Client Side</strong>: Store your key in
                            local storage and call the API directly from the
                            browser.
                        </li>
                        <li>
                            <strong>Hybrid</strong>: Store your key in the
                            database (powered by Supabase) and fetch your key
                            when you verify with OAuth (powered by Clerk). (Not
                            yet implemented)
                        </li>
                        <li>
                            <strong>Server Side</strong>: Deploy this
                            application yourself and use Environment Variables
                            to store your key. View the{' '}
                            <Link
                                className="text-blue-500 hover:underline"
                                href={process.env.NEXT_PUBLIC_REPO_URL || '#'}
                                target="_blank"
                            >
                                Github
                            </Link>{' '}
                            repo for instructions on how to deploy with your own
                            server-side keys.
                        </li>
                    </ul>
                </div>
                <ClientSideKey />
                <HybridKey />
            </div>
        </Dialog>
    );
}

function HybridKey() {
    const plausible = usePlausible();
    const { userId, signOut } = useAuth();
    const { setSignInOpen } = useUI();

    return (
        <div className="flex w-full flex-col gap-2 pt-2">
            <div className="flex items-center gap-2">
                <div className="text-lg">Database</div>
                {userId ? (
                    <button
                        onClick={() => {
                            try {
                                signOut();
                            } catch (err) {
                                console.error(err);
                            }
                        }}
                        className="text-sm text-blue-500 hover:underline"
                    >
                        Sign Out
                    </button>
                ) : (
                    <button
                        onClick={() => {
                            setSignInOpen(true);
                            plausible('SignIn');
                        }}
                        className="text-sm text-blue-500 hover:underline"
                    >
                        Sign In
                    </button>
                )}
            </div>
            {userId ? (
                <div>DB Config coming...</div>
            ) : (
                <>
                    <div>
                        Must be signed in to enable this feature (feature not
                        yet implemented)
                    </div>
                </>
            )}
        </div>
    );
}

function ClientSideKey() {
    const plausible = usePlausible();
    const { setOpenAIKeyOpen } = useUI();
    const { openAiApiKey, setOpenAiApiKey } = useChat();
    const [apiKey, setKey] = useState(openAiApiKey || '');
    const [validating, setValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setValidating(true);
        try {
            await validateOpenAIKey(apiKey);
            setError(null);
            setOpenAiApiKey(apiKey);
            setLocalOpenAiKey(apiKey);
            setOpenAIKeyOpen(false);
            plausible('Set Local Key');
        } catch (err: any) {
            setError(err.message);
        }
        setValidating(false);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-2 pt-2"
        >
            <div className="flex items-center gap-2">
                <div className="text-lg">OpenAI API Key</div>
                <Link
                    target="_blank"
                    title="Get API Key from OpenAI"
                    className="text-sm text-blue-500 hover:underline"
                    href="https://platform.openai.com/account/api-keys"
                >
                    Get Key
                </Link>
            </div>
            <div className="flex w-full gap-2">
                <Input
                    className="w-full p-1"
                    value={apiKey}
                    type="password"
                    placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    onChange={(e) => setKey(e.target.value)}
                />
                <button
                    onClick={() => {
                        setKey('');
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
            {error && <div className="text-sm text-red-500">{error}</div>}
        </form>
    );
}
