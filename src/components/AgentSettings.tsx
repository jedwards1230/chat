'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';

import { useChat } from '@/providers/ChatProvider';
import { defaultAgentConfig } from '@/providers/characters';
import Input from './Forms/Input';

const availableTools: Tool[] = [
    'calculator',
    'search',
    'web-browser',
    'wikipedia-api',
];

export default function AgentSettings({
    agent,
    active = false,
}: {
    agent?: AgentConfig;
    active?: boolean;
}) {
    const {
        updateThreadConfig,
        setSystemMessage,
        saveCharacter,
        activeThread,
    } = useChat();

    const [isNew, setIsNew] = useState(agent === undefined);
    const [config, setConfig] = useState(
        agent !== undefined
            ? agent
            : {
                  ...defaultAgentConfig,
                  name: 'New Character',
              },
    );

    const onFieldChange = (
        field: keyof AgentConfig,
        value: string | number | boolean,
    ) => {
        setConfig({ ...config, [field]: value });
        if (!isNew && active) {
            saveCharacter(config);
            updateThreadConfig({ [field]: value });
        }
    };

    const togglePlugin = (tool: Tool) => {
        const newTools = config.tools.includes(tool)
            ? config.tools.filter((t) => t !== tool)
            : [...config.tools, tool];

        setConfig({ ...config, tools: newTools });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (activeThread) {
            setSystemMessage(config.systemMessage);
            updateThreadConfig(config);
        }
        saveCharacter(config);
    };

    const modelInfo = [
        { Temperature: config.temperature },
        { 'Top P': config.topP },
        { N: config.N },
        { 'Max Tokens': config.maxTokens },
        { 'Frequency Penalty': config.frequencyPenalty },
        { 'Presence Penalty': config.presencePenalty },
    ];

    useEffect(() => {
        if (!isNew && active) {
            setConfig(activeThread.agentConfig);
        }
    }, [active, activeThread, isNew]);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-2 px-4">
                <Input
                    className={clsx(
                        'border-transparent p-1 text-lg font-bold focus:border-neutral-500 dark:bg-neutral-800',
                        active ? 'bg-neutral-800' : 'bg-neutral-200',
                    )}
                    placeholder="Agent Name"
                    required
                    value={config.name}
                    onChange={(e) => onFieldChange('name', e.target.value)}
                />
                <textarea
                    className={clsx(
                        'rounded border border-transparent p-1 font-medium focus:border-neutral-500 focus:outline-none dark:bg-neutral-800',
                        active ? 'bg-neutral-800' : 'bg-neutral-200',
                    )}
                    placeholder="Agent System Message"
                    required
                    value={config.systemMessage}
                    onChange={(e) =>
                        onFieldChange('systemMessage', e.target.value)
                    }
                />
            </div>
            <div className="flex flex-col gap-4 rounded-md px-4">
                <div className="flex w-full flex-col gap-2">
                    <label
                        className={clsx(
                            'flex flex-col rounded px-1 dark:hover:bg-neutral-600',
                            active
                                ? 'hover:bg-neutral-500'
                                : 'hover:bg-neutral-300',
                        )}
                    >
                        <div className="flex items-center justify-between gap-4 dark:border-neutral-600">
                            <div
                                className={clsx(
                                    'font-semibold dark:text-neutral-100',
                                    active
                                        ? 'text-neutral-100'
                                        : 'text-neutral-950',
                                )}
                            >
                                Plugins
                            </div>
                            <input
                                type="checkbox"
                                title="Toggle plugins"
                                className="h-4 w-4 cursor-pointer"
                                checked={config.toolsEnabled}
                                onChange={(e) =>
                                    onFieldChange(
                                        'toolsEnabled',
                                        e.target.checked,
                                    )
                                }
                            />
                        </div>
                        {config.toolsEnabled && (
                            <div
                                className={clsx(
                                    'text-xs dark:text-neutral-400',
                                    active
                                        ? 'text-neutral-400'
                                        : 'text-neutral-600',
                                )}
                            >
                                {config.tools.length} enabled
                            </div>
                        )}
                    </label>
                    {config.toolsEnabled && (
                        <div>
                            {availableTools.map((plugin) => {
                                const checked = config.tools.includes(plugin);
                                return (
                                    <label
                                        key={plugin}
                                        className={clsx(
                                            'flex w-full cursor-pointer items-center justify-between rounded p-1 text-sm dark:hover:bg-neutral-600',
                                            active
                                                ? 'hover:bg-neutral-500'
                                                : 'hover:bg-neutral-300',
                                        )}
                                    >
                                        <span className="capitalize">
                                            {plugin}
                                        </span>
                                        <input
                                            className="rounded-lg border p-2"
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() =>
                                                togglePlugin(plugin)
                                            }
                                        />
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>
                <details className="w-full">
                    <summary
                        className={clsx(
                            'cursor-pointer dark:hover:bg-neutral-700',
                            active
                                ? 'hover:bg-neutral-500'
                                : 'hover:bg-neutral-300',
                        )}
                    >
                        Advanced
                    </summary>
                    {modelInfo.map((info) => {
                        const [k, v] = Object.entries(info)[0];
                        return (
                            <div
                                key={k}
                                className={clsx(
                                    'flex w-full justify-between text-sm dark:text-neutral-400',
                                    active
                                        ? 'text-neutral-400'
                                        : 'text-neutral-600',
                                )}
                            >
                                <div>{k}:</div>
                                <div>{v}</div>
                            </div>
                        );
                    })}
                </details>
            </div>
            {!active && (
                <div className="flex w-full justify-end">
                    <button
                        type="submit"
                        className="rounded-md bg-neutral-300 px-3 py-2 transition-colors hover:bg-neutral-400 focus:bg-neutral-500 dark:bg-neutral-500 dark:hover:bg-neutral-600"
                    >
                        {!isNew ? 'Update' : 'Create'}
                    </button>
                </div>
            )}
        </form>
    );
}
