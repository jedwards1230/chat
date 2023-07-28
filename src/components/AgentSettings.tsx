'use client';

import { useChat } from '@/providers/ChatProvider';
import { useState } from 'react';

const availableTools: Tool[] = [
    'calculator',
    'search',
    'web-browser',
    'wikipedia-api',
];

export default function AgentSettings({ agent }: { agent: AgentConfig }) {
    const { updateThreadConfig, setSystemMessage, activeThread } = useChat();

    const [name, setName] = useState(agent.name);
    const [systemMessage, setSystem] = useState(agent.systemMessage);

    const [toolsEnabled, setToolsEnabled] = useState(agent.toolsEnabled);
    const [tools, setTools] = useState(agent.tools);

    const [temperature, setTemperature] = useState(agent.temperature);
    const [topP, setTopP] = useState(agent.topP);
    const [N, setN] = useState(agent.N);
    const [maxTokens, setMaxTokens] = useState(agent.maxTokens);
    const [frequencyPenalty, setFrequencyPenalty] = useState(
        agent.frequencyPenalty,
    );
    const [presencePenalty, setPresencePenalty] = useState(
        agent.presencePenalty,
    );

    const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    };

    const onSystemMessageChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
        setSystem(e.target.value);
    };

    const togglePlugins = () => {
        setToolsEnabled(!toolsEnabled);
    };

    const togglePlugin = (tool: Tool) => {
        const newTools = tools.includes(tool)
            ? tools.filter((t) => t !== tool)
            : [...tools, tool];

        setTools(newTools);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (activeThread) {
            setSystemMessage(systemMessage);
            updateThreadConfig({
                name,
                systemMessage,
                toolsEnabled,
                tools,
                temperature,
                topP,
                N,
                maxTokens,
                frequencyPenalty,
                presencePenalty,
            });
        }
    };

    const modelInfo = [
        { Temperature: temperature },
        { 'Top P': topP },
        { N: N },
        { 'Max Tokens': maxTokens },
        { 'Frequency Penalty': frequencyPenalty },
        { 'Presence Penalty': presencePenalty },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-2 px-4">
                <input
                    className="rounded border border-transparent bg-neutral-800 p-1 text-lg font-bold focus:border-neutral-500 focus:outline-none"
                    type="text"
                    placeholder="Agent Name"
                    required
                    value={name}
                    onChange={onNameChange}
                />
                <textarea
                    className="rounded border border-transparent bg-neutral-800 p-1 font-medium focus:border-neutral-500 focus:outline-none"
                    placeholder="Agent System Message"
                    required
                    value={systemMessage}
                    onChange={onSystemMessageChange}
                />
            </div>
            <div className="flex flex-col gap-4 rounded-md px-4">
                <div className="flex w-full flex-col gap-2">
                    <label className="flex flex-col rounded px-1 hover:bg-neutral-500 dark:hover:bg-neutral-600">
                        <div className="flex items-center justify-between gap-4 dark:border-neutral-600">
                            <div className="font-semibold text-neutral-100">
                                Plugins
                            </div>
                            <input
                                type="checkbox"
                                title="Toggle plugins"
                                className="h-4 w-4 cursor-pointer"
                                checked={toolsEnabled}
                                onChange={togglePlugins}
                            />
                        </div>
                        {toolsEnabled && (
                            <div className="text-xs text-neutral-600 dark:text-neutral-400">
                                {tools.length} enabled
                            </div>
                        )}
                    </label>
                    {toolsEnabled && (
                        <div>
                            {availableTools.map((plugin) => {
                                const checked = tools.includes(plugin);
                                return (
                                    <label
                                        key={plugin}
                                        className="flex w-full cursor-pointer items-center justify-between rounded p-1 text-sm hover:bg-neutral-500 dark:hover:bg-neutral-600"
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
                    <summary className="cursor-pointer dark:hover:bg-neutral-700">
                        Advanced
                    </summary>
                    {modelInfo.map((info) => {
                        const [k, v] = Object.entries(info)[0];
                        return (
                            <div
                                key={k}
                                className="flex w-full justify-between text-sm text-neutral-600 dark:text-neutral-400"
                            >
                                <div>{k}:</div>
                                <div>{v}</div>
                            </div>
                        );
                    })}
                </details>
            </div>
            <div className="flex w-full justify-end">
                <button
                    type="submit"
                    className="rounded-md bg-neutral-500 px-3 py-2 transition-colors dark:bg-neutral-500 dark:hover:bg-neutral-600"
                >
                    Apply
                </button>
            </div>
        </form>
    );
}
