import Link from 'next/link';

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

export default function OpenAIKey() {
    const { openAiApiKey, setOpenAiApiKey } = useChat();
    const { setOpenAIKeyOpen } = useUI();
    const [apiKey, setKey] = useState(openAiApiKey || '');
    const [error, setError] = useState<string | null>(null);
    const [validating, setValidating] = useState(false);

    const close = () => {
        setOpenAIKeyOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setValidating(true);
        try {
            await validateOpenAIKey(apiKey);
            setError(null);
            setOpenAiApiKey(apiKey);
            setLocalOpenAiKey(apiKey);
            close();
        } catch (err: any) {
            setError(err.message);
        }
        setValidating(false);
    };

    return (
        <Dialog callback={close}>
            <div className="flex flex-col items-center gap-2">
                An OpenAI API key is required to use this application.
                <form
                    onSubmit={handleSubmit}
                    className="flex w-full gap-2 pt-2"
                >
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
                </form>
                {error && <div className="text-sm text-red-500">{error}</div>}
                <Link
                    target="_blank"
                    title="Get API Key from OpenAI"
                    className="text-sm text-blue-500 hover:underline"
                    href="https://platform.openai.com/account/api-keys"
                >
                    Get OpenAI API Key
                </Link>
                <div className="text-center text-xs text-neutral-500">
                    This will only be stored client-side and only used when
                    making calls to OpenAI
                </div>
                <div className="text-center text-xs text-neutral-500">
                    There will eventually be an option for storing the key in a
                    cloud db (Auth with Clerk and DB with Supabase for now).
                </div>
            </div>
        </Dialog>
    );
}
