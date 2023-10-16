'use client';

import { useEffect, useState } from 'react';

import { defaultAgentConfig } from '@/providers/characters';
import { modelList, modelMap } from '@/providers/models';
import { useChat } from '@/providers/ChatProvider';
import { availableTools } from '@/tools/config';
import { Textarea } from '../../ui/textarea';
import { Checkbox } from '../../ui/checkbox';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../ui/select';

export default function CharacterSettings({ agent }: { agent?: AgentConfig }) {
    const {
        activeThread,
        updateThreadConfig,
        setSystemMessage,
        saveCharacter,
        defaultThread,
        streamResponse,
        setStreamResponse,
    } = useChat();

    const thread = activeThread || defaultThread;
    const isNew = agent === undefined;
    const [config, setConfig] = useState(
        agent
            ? agent
            : {
                  ...defaultAgentConfig,
                  name: 'New Character',
              },
    );
    useEffect(() => setConfig(thread.agentConfig), [thread]);

    const onFieldChange = (
        field: keyof AgentConfig,
        value: string | number | boolean,
    ) => {
        const update = { ...config, [field]: value };

        if (field === 'model') {
            const model = modelMap[value as Model];
            if (model) update.model = model;
        }

        setConfig(update);
    };

    const togglePlugin = (tool: Tool) => {
        const newTools = config.tools?.includes(tool)
            ? config.tools.filter((t) => t !== tool)
            : [...config.tools, tool];

        setConfig({ ...config, tools: newTools });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (thread) {
            setSystemMessage(config.systemMessage);
            updateThreadConfig(config);
        }
        saveCharacter(config);
    };

    const params = config.model.params;

    const modelInfo = [
        { Temperature: params?.temperature },
        { 'Top P': params?.topP },
        { N: params?.N },
        { 'Max Tokens': params?.maxTokens },
        { 'Frequency Penalty': params?.frequencyPenalty },
        { 'Presence Penalty': params?.presencePenalty },
    ];

    const functionsAllowed = config.model.api !== 'llama';
    const streamingAllowed = config.model.api !== 'llama';

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="flex flex-col gap-2">
                <Input
                    placeholder="Agent Name"
                    required
                    value={config.name}
                    onChange={(e) => onFieldChange('name', e.target.value)}
                />
                <Textarea
                    placeholder="Agent System Message"
                    required
                    value={config.systemMessage}
                    onChange={(e) =>
                        onFieldChange('systemMessage', e.target.value)
                    }
                />
            </div>
            <div className="flex flex-col gap-4 rounded-md">
                <Select
                    onValueChange={(v) => v && onFieldChange('model', v)}
                    value={config.model.name}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={config.model.name} />
                    </SelectTrigger>
                    <SelectContent>
                        {modelList.map((model) => (
                            <SelectItem
                                key={'select-' + model.name}
                                value={model.name}
                            >
                                {model.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {streamingAllowed && (
                    <div className="flex justify-between px-1">
                        <Label htmlFor="stream-response">Stream Response</Label>
                        <Checkbox
                            id="stream-response"
                            checked={streamResponse}
                            onCheckedChange={setStreamResponse}
                        />
                    </div>
                )}
                {functionsAllowed && (
                    <div className="flex w-full flex-col gap-2">
                        <label className="flex flex-col rounded px-1 transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-600">
                            <div className="flex items-center justify-between gap-4 dark:border-neutral-600">
                                <div className="font-semibold text-neutral-950 transition-colors dark:text-neutral-100">
                                    Plugins
                                </div>
                                <Checkbox
                                    title="Toggle plugins"
                                    checked={config.toolsEnabled}
                                    onCheckedChange={(e) =>
                                        onFieldChange('toolsEnabled', e)
                                    }
                                />
                            </div>
                            {config.toolsEnabled && (
                                <div className="text-xs text-neutral-600 transition-colors dark:text-neutral-400">
                                    {config.tools.length} enabled
                                </div>
                            )}
                        </label>
                        {config.toolsEnabled && (
                            <div>
                                {availableTools.map((plugin) => {
                                    const checked =
                                        config.tools.includes(plugin);
                                    return (
                                        <label
                                            key={plugin}
                                            className="flex w-full cursor-pointer items-center justify-between rounded p-1 text-sm hover:bg-neutral-300 dark:hover:bg-neutral-600"
                                        >
                                            <span className="capitalize">
                                                {plugin}
                                            </span>
                                            <Checkbox
                                                checked={checked}
                                                onCheckedChange={() =>
                                                    togglePlugin(plugin)
                                                }
                                            />
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
                <details className="w-full">
                    <summary className="cursor-pointer hover:bg-neutral-300 dark:hover:bg-neutral-700">
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
                <Button variant="outlineAccent" type="submit">
                    {!isNew ? 'Update' : 'Create'}
                </Button>
            </div>
        </form>
    );
}
