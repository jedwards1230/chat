'use client';

import { useChat } from '@/providers/ChatProvider';
import { useUI } from '@/providers/UIProvider';
import Dialog from './Dialog';
import { useState } from 'react';
import { defaultAgents } from '@/providers/initialChat';
import AgentSettings from '../AgentSettings';
import clsx from 'clsx';
import { PencilSquare } from '../Icons';

export default function PersonalitySelector() {
    const { activeThread, updateThreadConfig, setSystemMessage } = useChat();
    const { personalitySelectorOpen, setPersonalitySelectorOpen } = useUI();
    const [activeCard, setActiveCard] = useState<string | undefined>(undefined);

    const agents = defaultAgents;

    const closeDialog = () => {
        setPersonalitySelectorOpen(false);
    };

    const setActive = (agent: AgentConfig) => {
        if (activeThread) {
            updateThreadConfig(agent);
            setSystemMessage(agent.systemMessage);
        }
    };

    if (!personalitySelectorOpen) return null;
    return (
        <Dialog callback={closeDialog}>
            <div className="w-full pb-4 text-center text-xl font-semibold">
                Personality {activeCard === undefined ? 'Selector' : 'Editor'}
            </div>
            {activeCard !== undefined && (
                <button
                    onClick={() => setActiveCard(undefined)}
                    className="absolute left-6 top-5 text-neutral-500 hover:text-neutral-200"
                >
                    go back
                </button>
            )}
            {activeCard === undefined ? (
                <div className="h-[450px] space-y-2 overflow-y-scroll">
                    {agents.map((agent, i) => {
                        const active =
                            agent.name === activeThread.agentConfig.name;
                        return (
                            <AgentCard
                                key={'agent-config-' + i}
                                agent={agent}
                                active={active}
                                setActive={() => setActive(agent)}
                                edit={() => setActiveCard(agent.name)}
                            />
                        );
                    })}
                </div>
            ) : (
                <AgentSettings
                    agent={agents.find((agent) => agent.name === activeCard)!}
                />
            )}
        </Dialog>
    );
}

function AgentCard({
    agent,
    active,
    setActive,
    edit,
}: {
    agent: AgentConfig;
    active: boolean;
    setActive: () => void;
    edit: () => void;
}) {
    return (
        <div
            onClick={setActive}
            className={clsx(
                'flex cursor-pointer items-center justify-between rounded-lg py-2 pl-4 pr-6 shadow transition-colors',
                active
                    ? 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'
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
                        : 'hover:bg-neutral-500 dark:hover:bg-neutral-500',
                )}
            >
                <PencilSquare />
            </div>
        </div>
    );
}
