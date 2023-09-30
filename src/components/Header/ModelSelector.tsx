'use client';

import { useChat } from '@/providers/ChatProvider';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function ModelSelector() {
    const { activeThread, updateThreadConfig } = useChat();
    const activeModel = activeThread.agentConfig.model;

    const isGPT3 =
        activeModel === 'gpt-3.5-turbo-16k' || activeModel === 'gpt-3.5-turbo';
    const isGPT4 = activeModel === 'gpt-4' || activeModel === 'gpt-4-0613';

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex p-1 rounded-lg bg-accent">
                <div className="relative flex flex-row gap-4 group">
                    <button
                        className={clsx(
                            'z-10 w-32 flex-1 rounded-lg px-4 py-2 text-center font-medium transition-colors',
                            isGPT3 ? 'text-foreground' : 'text-background/50',
                        )}
                        onClick={() =>
                            updateThreadConfig({ model: 'gpt-3.5-turbo-16k' })
                        }
                    >
                        GPT-3.5
                    </button>
                    <button
                        className={clsx(
                            'z-10 w-32 flex-1 rounded-lg px-4 py-2 text-center font-medium transition-colors',
                            isGPT4 ? 'text-foreground' : 'text-background/50',
                        )}
                        onClick={() => updateThreadConfig({ model: 'gpt-4' })}
                    >
                        GPT-4
                    </button>
                    <motion.div
                        layoutId="config-tab"
                        className={clsx(
                            'absolute top-0 h-full w-32 rounded-lg bg-background sm:group-hover:dark:bg-neutral-600/40',
                            isGPT3 ? 'left-0' : 'right-0',
                        )}
                    />
                </div>
            </div>
        </div>
    );
}
