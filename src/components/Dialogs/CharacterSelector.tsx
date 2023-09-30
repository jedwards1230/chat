'use client';

import { useChat } from '@/providers/ChatProvider';
import { useEffect, useRef, useState } from 'react';
import AgentSettings from '../AgentSettings';
import clsx from 'clsx';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';

export default function CharacterSelector({
    children,
}: {
    children: React.ReactNode;
}) {
    const { activeThread, characterList } = useChat();
    const [activeCard, setActiveCard] = useState<AgentConfig>(
        activeThread.agentConfig,
    );

    return (
        <Dialog>
            <DialogTrigger>{children}</DialogTrigger>
            <DialogContent>
                <div className="grid w-full grid-cols-12 pb-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                            setActiveCard({
                                ...activeCard,
                                name: 'New Character',
                            })
                        }
                        className="text-xl bg-inherit hover:bg-accent/30"
                    >
                        +
                    </Button>
                    <div className="flex-1 col-span-8 col-start-3 text-xl font-semibold text-center">
                        Character{' '}
                        {activeCard === undefined ? 'Selector' : 'Editor'}
                    </div>
                </div>
                <div className="grid w-full grid-cols-3 gap-4 md:grid-cols-10">
                    <div className="col-span-4 flex max-h-[80vh] w-full gap-2 overflow-y-scroll md:flex-col">
                        {characterList.map((agent, i) => {
                            const active =
                                agent.id === activeThread.agentConfig.id;
                            return (
                                <AgentCard
                                    key={'agent-config-' + i}
                                    agent={agent}
                                    active={active}
                                    edit={() =>
                                        setActiveCard({
                                            ...activeCard,
                                            name: agent.name,
                                        })
                                    }
                                />
                            );
                        })}
                    </div>
                    <div className="col-span-6">
                        <AgentSettings
                            key={activeCard.id}
                            active={true}
                            agent={characterList.find(
                                (agent) => agent.id === activeCard.id,
                            )}
                        />
                    </div>
                </div>
            </DialogContent>
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
