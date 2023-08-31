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
                className="flex items-end justify-center w-full gap-2 px-4 pt-4 pb-6 transition-all border-t shadow-xl justify-self-end border-border dark:shadow-none sm:pb-4 md:pb-2 md:pt-2"
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
                        className="flex-1 w-full py-2 pl-2 pr-24 transition-colors border-2 rounded-lg shadow resize-none bg-background dark:bg-accent border-border focus:border-blue-primary focus:outline-none"
                    />
                    {editId ? (
                        <div className="flex justify-between gap-4 pt-2">
                            <button
                                className="rounded-lg border border-transparent bg-blue-500 px-6 py-1.5 transition-colors hover:bg-blue-400 focus:border-blue-500 focus:bg-blue-400 focus:outline-none dark:bg-blue-500 dark:hover:bg-blue-400"
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
                                'absolute bottom-3 right-3 rounded-lg border border-transparent p-1 transition-colors focus:outline-none',
                                input.length > 0
                                    ? 'cursor-pointer text-background bg-blue-500 hover:bg-blue-400 focus:border-blue-500 focus:bg-blue-400 dark:bg-blue-500 dark:hover:bg-blue-400'
                                    : 'cursor-default text-foreground',
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
