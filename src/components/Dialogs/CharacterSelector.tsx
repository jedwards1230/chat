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
    const [activeCard, setActiveCard] = useState<string | undefined>(
        activeThread.agentConfig.name,
    );

    const closeDialog = () => {
        setCharacterSelectorOpen(false);
    };

    if (!characterSelectorOpen) return null;
    return (
        <Dialog size="xl" callback={closeDialog}>
            <div className="grid w-full grid-cols-12 pb-4">
                {activeCard !== undefined ? (
                    <button
                        onClick={() => setActiveCard(undefined)}
                        className="col-span-2 py-1 text-neutral-400 hover:text-neutral-950 dark:text-neutral-500 dark:hover:text-neutral-200 md:hidden"
                    >
                        go back
                    </button>
                ) : (
                    <div className="col-span-2" />
                )}
                <div className="col-span-8 col-start-3 flex-1 text-center text-xl font-semibold">
                    Character {activeCard === undefined ? 'Selector' : 'Editor'}
                </div>
                <button
                    onClick={() => setActiveCard('New Character')}
                    className="col-span-2 rounded-md py-1 text-neutral-400 hover:text-neutral-950 dark:text-neutral-500 dark:hover:text-neutral-200"
                >
                    + New
                </button>
            </div>
            <div className="hidden md:flex">
                <div className="max-h-[80vh] space-y-2 overflow-y-scroll">
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
                <AgentSettings
                    key={activeCard}
                    agent={characterList.find(
                        (agent) => agent.name === activeCard,
                    )}
                />
            </div>
            <div className="flex md:hidden">
                {activeCard === undefined ? (
                    <div className="max-h-[80vh] space-y-2 overflow-y-scroll">
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
                        agent={characterList.find(
                            (agent) => agent.name === activeCard,
                        )}
                    />
                )}
            </div>
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
            className={clsx(
                'flex cursor-pointer items-center justify-between rounded-lg shadow transition-colors',
                active
                    ? 'bg-green-400 hover:bg-green-500 dark:bg-green-600 dark:hover:bg-green-700'
                    : 'hover:bg-neutral-200 dark:hover:bg-neutral-600',
            )}
        >
            <div
                onClick={setActive}
                className="h-full w-full px-2 py-1 md:hidden"
            >
                <h2 className="text-lg font-medium">{agent.name}</h2>
                <p>{agent.systemMessage}</p>
            </div>
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    setActive();
                    edit();
                }}
                className="hidden h-full w-full flex-col px-2 py-1 md:flex"
            >
                {agent.name}
            </div>
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    edit();
                }}
                className={clsx(
                    'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors md:hidden ',
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
