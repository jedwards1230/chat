import { Check } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import Image from 'next/image';
import { usePlausible } from 'next-plausible';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { XMark } from '@/components/Icons';
import { useChat } from '@/providers/ChatProvider';
import { validateOpenAIKey } from '@/utils/client/client';
import { Input } from '@/components/ui/input';
import {
    setLocalOpenAiKey,
    deleteLocalOpenAiKey,
} from '@/utils/client/localstorage';
import { DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUI } from '@/providers/UIProvider';
import { AUTH_ENABLED } from '@/appConfig';

export default function CredentialsSection({ user }: { user?: User }) {
    return (
        <div className="flex flex-col gap-4">
            <div>
                <DialogHeader>Credentials</DialogHeader>

                {user && (
                    <>
                        <div className="font-medium">Cloud Auth</div>
                        <div className="flex w-full items-center justify-between pb-4 pt-2">
                            <div className="flex w-full flex-col gap-0 overflow-x-scroll">
                                <div>{user.name}</div>
                                <div>{user.email}</div>
                            </div>
                            <Image
                                src={user.image || ''}
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
            <div>
                {AUTH_ENABLED && <KeyInfo />}
                <ClientSideKey />
                {AUTH_ENABLED && <HybridKey />}
            </div>
        </div>
    );
}

function KeyInfo() {
    return (
        <div className="space-y-1 text-base">
            <p className="pb-3">
                An OpenAI API key is required to use this application.
            </p>
            <p>Your key can be used in 3 ways:</p>
            <ul className="list-inside">
                <li>
                    <strong>Client Side</strong>: Store your key in local
                    storage and call the API directly from the browser.
                </li>
                <li>
                    <strong>Hybrid</strong>: Store your key in the database
                    (powered by Supabase) and fetch your key when you verify
                    with GitHub OAuth. (Not yet implemented)
                </li>
                <li>
                    <strong>Server Side</strong>: Deploy this application
                    yourself and use Environment Variables to store your key.
                    View the{' '}
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
    );
}

function HybridKey() {
    const plausible = usePlausible();
    const router = useRouter();
    const { data: session } = useSession();
    const userId = session?.user?.email;

    return (
        <div className="flex w-full flex-col gap-2 pt-2">
            <div className="flex items-center gap-2">
                <DialogHeader>Database</DialogHeader>
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
                            router.push('/api/auth/signin');
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
    const { openAiApiKey, setOpenAiApiKey } = useChat();
    const { setAppSettingsOpen } = useUI();
    const [apiKey, setKey] = useState(openAiApiKey || '');
    const [validating, setValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setValidating(true);
        try {
            await validateOpenAIKey(apiKey);
            setOpenAiApiKey(apiKey);
            setLocalOpenAiKey(apiKey);
            setAppSettingsOpen(false);
            plausible('Set Local Key');
        } catch (err: any) {
            setError(err.message);
        }
        setValidating(false);
    };

    const deleteKey = (e: any) => {
        e.preventDefault();
        setKey('');
        deleteLocalOpenAiKey();
        setOpenAiApiKey();
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-2 pt-2"
        >
            <div className="flex items-center gap-2">
                <DialogHeader>OpenAI API Key</DialogHeader>
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
                    className="w-full"
                    value={apiKey}
                    type="password"
                    placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    onChange={(e) => setKey(e.target.value)}
                />
                <Button
                    onClick={deleteKey}
                    size="icon"
                    title="Delete"
                    id="delete-key"
                    disabled={validating}
                    className="scale-90 rounded bg-red-500 p-1 text-neutral-50 transition-colors hover:bg-red-600 disabled:bg-neutral-500"
                >
                    <XMark />
                </Button>
                <Button
                    type="submit"
                    size="icon"
                    title="Save"
                    id="save-key"
                    disabled={validating}
                    className="scale-90 rounded bg-green-500 p-1 text-neutral-50 transition-colors hover:bg-green-600 disabled:bg-neutral-500"
                >
                    <Check />
                </Button>
            </div>
            {error && <div className="text-sm text-red-500">{error}</div>}
        </form>
    );
}
