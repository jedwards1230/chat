'use client';

import { useChat } from '@/providers/ChatProvider';
import { useUI } from '@/providers/UIProvider';
import Dialog from './Dialog';
import { useState } from 'react';
import AgentSettings from '../AgentSettings';
import clsx from 'clsx';
import { PencilSquare } from '../Icons';

export default function PersonalitySelector() {
    const { activeThread, characterList } = useChat();
    const { characterSelectorOpen, setCharacterSelectorOpen } = useUI();
    const [activeCard, setActiveCard] = useState<string | undefined>(undefined);

    const closeDialog = () => {
        setCharacterSelectorOpen(false);
    };

    if (!characterSelectorOpen) return null;
    return (
        <Dialog callback={closeDialog}>
            <div className="w-full pb-4 text-center text-xl font-semibold">
                Character {activeCard === undefined ? 'Selector' : 'Editor'}
            </div>
            {activeCard !== undefined && (
                <button
                    onClick={() => setActiveCard(undefined)}
                    className="absolute left-6 top-5 text-neutral-400 hover:text-neutral-950 dark:text-neutral-500 dark:hover:text-neutral-200"
                >
                    go back
                </button>
            )}
            {activeCard === undefined ? (
                <div className="h-[450px] space-y-2 overflow-y-scroll">
                    {characterList.map((agent, i) => {
                        const active =
                            agent.name === activeThread.agentConfig.name;
                        return (
                            <AgentCard
                                key={'agent-config-' + i}
                                agent={agent}
                                active={active}
                                edit={() => setActiveCard(agent.name)}
                            />
                        );
                    })}
                </div>
            ) : (
                <AgentSettings
                    agent={
                        characterList.find(
                            (agent) => agent.name === activeCard,
                        )!
                    }
                />
            )}
        </Dialog>
    );
}

function AgentCard({
    agent,
    active,
    edit,
}: {
    agent: AgentConfig;
    active: boolean;
    edit: () => void;
}) {
    const { activeThread, updateThreadConfig, setSystemMessage } = useChat();

    const setActive = () => {
        if (activeThread) {
            updateThreadConfig(agent);
            setSystemMessage(agent.systemMessage);
        }
    };

    return (
        <div
            onClick={setActive}
            className={clsx(
                'flex cursor-pointer items-center justify-between rounded-lg py-2 pl-4 pr-6 shadow transition-colors',
                active
                    ? 'bg-green-400 hover:bg-green-500 dark:bg-green-600 dark:hover:bg-green-700'
                    : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600',
            )}
        >
            <div>
                <h2 className="text-lg font-bold">{agent.name}</h2>
                <p>{agent.systemMessage}</p>
            </div>
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    edit();
                }}
                className={clsx(
                    'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors ',
                    active
                        ? 'hover:bg-green-600 dark:hover:bg-green-800'
                        : 'hover:bg-neutral-300 dark:hover:bg-neutral-500',
                )}
            >
                <PencilSquare />
            </div>
        </div>
    );
}
