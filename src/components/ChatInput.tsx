'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

import { useChat } from '@/providers/ChatProvider';
import QuickActions from './QuickActions';
import { isMobile } from '@/utils/client';
import { calculateRows } from '@/utils';
import { Send } from './Icons';

export default function ChatInput() {
    const {
        activeThread,
        input,
        editId,
        changeInput,
        handleSubmit,
        cancelEdit,
    } = useChat();

    const [activeId, setActiveId] = useState<string>(activeThread.id);
    const inputRef = useRef<HTMLTextAreaElement>(null);

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

    useEffect(() => {
        if (activeThread.id !== activeId) {
            setActiveId(activeThread.id);
            inputRef.current?.focus();
        }
    }, [activeId, activeThread.id]);

    return (
        <div className="relative w-full">
            <QuickActions />
            <form
                onSubmit={handleSubmit}
                className={clsx(
                    'flex w-full items-end justify-center gap-2 justify-self-end border-t border-neutral-300 px-4 pb-8 pt-4 shadow-xl transition-all dark:border-0 dark:border-neutral-600 dark:shadow-none sm:pb-4 md:pb-2 md:pt-2',
                    editId && 'flex-col',
                )}
            >
                <div className="relative w-full max-w-4xl">
                    <motion.textarea
                        ref={inputRef}
                        placeholder="Say something..."
                        value={input}
                        onClick={(e) => inputRef.current?.focus()}
                        rows={rows}
                        onChange={handleInputChange}
                        onKeyDown={onKeyDownHandler}
                        className="w-full flex-1 resize-none rounded-lg border-2 border-neutral-200 py-4 pl-2 pr-24 shadow transition-colors focus:border-blue-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800"
                    />
                    {editId ? (
                        <div className="flex justify-between gap-4 pt-2">
                            <button
                                className="rounded-lg border border-transparent bg-blue-500 px-6 py-1.5 text-neutral-50 transition-colors hover:bg-blue-400 focus:border-blue-500 focus:bg-blue-400 focus:outline-none dark:bg-blue-500 dark:hover:bg-blue-400"
                                onClick={handleSubmit}
                            >
                                Update and Regenerate
                            </button>
                            {/* <button
                                className="rounded-lg border border-transparent bg-green-500 px-6 py-1.5 text-neutral-50 transition-colors hover:bg-green-400 focus:border-green-500 focus:bg-green-400 focus:outline-none dark:bg-green-500 dark:hover:bg-green-400"
                                onClick={handleSubmit}
                            >
                                Replace Only
                            </button> */}
                            <button
                                className="rounded-lg border border-transparent bg-neutral-300 px-6 py-1.5 transition-colors hover:bg-neutral-400 focus:border-blue-500 focus:bg-neutral-400 focus:outline-none dark:bg-neutral-500 dark:hover:bg-neutral-400"
                                onClick={cancelEdit}
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            className={clsx(
                                'absolute bottom-4 right-2 rounded-lg border border-transparent p-1 text-neutral-50 transition-colors focus:outline-none dark:bg-blue-500 dark:hover:bg-blue-400',
                                input.length > 0
                                    ? 'cursor-pointer bg-blue-500 hover:bg-blue-400 focus:border-blue-500 focus:bg-blue-400'
                                    : 'cursor-default text-neutral-600',
                            )}
                            type="submit"
                        >
                            <Send />
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
