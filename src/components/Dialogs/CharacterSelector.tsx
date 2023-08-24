'use client';

import { useChat } from '@/providers/ChatProvider';
import { useUI } from '@/providers/UIProvider';
import Dialog from './Dialog';
import { useEffect, useRef, useState } from 'react';
import AgentSettings from '../AgentSettings';
import clsx from 'clsx';

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
            <div className="flex w-full flex-col gap-4 md:flex-row md:gap-2">
                <div className="flex max-h-[80vh] w-full gap-2 overflow-y-scroll md:w-2/5 md:flex-col">
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
    const cardRef = useRef<HTMLDivElement>(null);

    const setActive = (e: any) => {
        e.stopPropagation();
        if (activeThread) {
            updateThreadConfig(agent);
            setSystemMessage(agent.systemMessage);
        }
        edit();
    };

    useEffect(() => {
        if (active) {
            cardRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [active]);

    return (
        <div
            ref={cardRef}
            onClick={setActive}
            className={clsx(
                'mb-3 flex cursor-pointer items-center whitespace-nowrap rounded-lg px-2 py-1 shadow transition-colors md:mb-0',
                active
                    ? 'bg-green-400 hover:bg-green-500 dark:bg-green-600 dark:hover:bg-green-700'
                    : 'hover:bg-neutral-200 dark:hover:bg-neutral-600',
            )}
        >
            {agent.name}
        </div>
    );
}
