'use client';

import { useChat } from '@/providers/ChatProvider';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function ModelSelector() {
    const { activeThread, updateThreadConfig } = useChat();
    const activeModel = activeThread.agentConfig.model;

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex rounded-lg bg-neutral-200 p-1 dark:bg-neutral-900">
                <div className="group relative flex flex-row gap-4">
                    <button
                        className={clsx(
                            'z-10 w-32 flex-1 rounded-lg px-4 py-2 text-center font-medium',
                            activeModel === 'gpt-3.5-turbo-16k' ||
                                activeModel === 'gpt-3.5-turbo'
                                ? 'text-neutral-700 dark:text-white'
                                : 'text-neutral-400 dark:text-neutral-400',
                        )}
                        onClick={() =>
                            updateThreadConfig({ model: 'gpt-3.5-turbo-16k' })
                        }
                    >
                        GPT-3.5
                    </button>
                    <button
                        className={clsx(
                            'z-10 w-32 flex-1 rounded-lg px-4 py-2 text-center font-medium',
                            activeModel === 'gpt-4' ||
                                activeModel === 'gpt-4-0613'
                                ? 'text-neutral-700 dark:text-white'
                                : 'text-neutral-400 dark:text-neutral-400',
                        )}
                        onClick={() => updateThreadConfig({ model: 'gpt-4' })}
                    >
                        GPT-4
                    </button>
                    <motion.div
                        layoutId="config-tab"
                        className={clsx(
                            'absolute top-0 h-full w-32 rounded-lg bg-neutral-100 dark:bg-neutral-600/40 sm:group-hover:dark:bg-neutral-600',
                            activeModel === 'gpt-3.5-turbo-16k' ||
                                activeModel === 'gpt-3.5-turbo'
                                ? 'left-0'
                                : 'right-0',
                        )}
                    />
                </div>
            </div>
        </div>
    );
}
