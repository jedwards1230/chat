'use client';

import { useChat } from '@/providers/ChatProvider';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import QuickActions from './QuickActions';
import { isMobile } from '@/utils/client';
import { calculateRows } from '@/utils';

export default function ChatInput() {
    const state = useChat();
    const { input, editId, changeInput, handleSubmit, cancelEdit } = state;

    const rows = calculateRows(input);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        changeInput(e.target.value);
    };

    const onKeyDownHandler = (e: any) => {
        if (e.key === 'Enter' && !e.shiftKey && !isMobile()) {
            e.preventDefault();
            changeInput(e.target.value);
            handleSubmit(e);
        }
    };

    return (
        <div className="relative w-full">
            <QuickActions />
            <form
                onSubmit={handleSubmit}
                className={clsx(
                    'flex w-full items-end justify-center gap-2 justify-self-end border-t border-neutral-300 px-4 pb-8 pt-2 shadow-xl transition-all dark:border-0 dark:border-neutral-600 dark:shadow-none sm:pb-4',
                    editId && 'flex-col',
                )}
            >
                <motion.textarea
                    placeholder="Say something..."
                    value={input}
                    autoFocus
                    rows={rows}
                    onChange={handleInputChange}
                    onKeyDown={onKeyDownHandler}
                    className="w-full flex-1 rounded border-2 border-neutral-200 p-2 transition-colors focus:border-blue-500 focus:outline-none dark:border-neutral-500 dark:bg-neutral-700"
                />
                {input &&
                    (editId ? (
                        <div className="flex gap-4">
                            <button
                                className="rounded-lg border border-transparent bg-blue-500 px-6 py-1.5 text-neutral-50 transition-colors hover:bg-blue-400 focus:border-blue-500 focus:bg-blue-400 focus:outline-none dark:bg-blue-500 dark:hover:bg-blue-400"
                                onClick={handleSubmit}
                            >
                                Update and Regenerate
                            </button>
                            <button
                                className="rounded-lg border border-transparent bg-green-500 px-6 py-1.5 text-neutral-50 transition-colors hover:bg-green-400 focus:border-green-500 focus:bg-green-400 focus:outline-none dark:bg-green-500 dark:hover:bg-green-400"
                                onClick={handleSubmit}
                            >
                                Replace Only
                            </button>
                            <button
                                className="rounded-lg border border-transparent bg-neutral-300 px-6 py-1.5 transition-colors hover:bg-neutral-400 focus:border-blue-500 focus:bg-neutral-400 focus:outline-none dark:bg-neutral-500 dark:hover:bg-neutral-400"
                                onClick={cancelEdit}
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            className="rounded-lg border border-transparent bg-blue-500 px-4 py-1.5 text-neutral-50 transition-colors hover:bg-blue-400 focus:border-blue-500 focus:bg-blue-400 focus:outline-none dark:bg-blue-500 dark:hover:bg-blue-400 md:px-6"
                            type="submit"
                        >
                            Send
                        </button>
                    ))}
            </form>
        </div>
    );
}
