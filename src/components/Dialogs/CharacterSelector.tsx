'use client';

import clsx from 'clsx';
import { useState, memo } from 'react';

import { useChat } from '@/providers/ChatProvider';
import AgentSettings from '../AgentSettings';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';

function CharacterSelector({ children }: { children: React.ReactNode }) {
    const { activeThread, defaultThread, characterList } = useChat();
    const thread = activeThread || defaultThread;
    const [activeCard, setActiveCard] = useState<AgentConfig>(
        thread.agentConfig,
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
                        className="bg-inherit text-xl hover:bg-accent/30"
                    >
                        +
                    </Button>
                    <div className="col-span-8 col-start-3 flex-1 text-center text-xl font-semibold">
                        Character{' '}
                        {activeCard === undefined ? 'Selector' : 'Editor'}
                    </div>
                </div>
                <div className="grid w-full grid-cols-3 gap-4 md:grid-cols-10">
                    <div className="col-span-4 flex max-h-[80vh] w-full flex-col justify-between gap-2">
                        <div className="flex w-full gap-2 overflow-y-scroll md:flex-col">
                            {characterList.map((agent, i) => {
                                const active =
                                    agent.id === thread.agentConfig.id;
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
                        <Button variant="link" size="sm">
                            Reset defaults
                        </Button>
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

export default memo(CharacterSelector);

function AgentCard({
    agent,
    active,
    edit,
}: {
    agent: AgentConfig;
    active: boolean;
    edit: () => void;
}) {
    const { updateThreadConfig, setSystemMessage } = useChat();

    const setActive = (e: any) => {
        e.stopPropagation();
        updateThreadConfig(agent);
        setSystemMessage(agent.systemMessage);
        edit();
    };

    return (
        <Button
            variant={active ? 'primaryGreen' : 'outline'}
            onClick={setActive}
        >
            {agent.name}
        </Button>
    );
}
