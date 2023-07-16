'use client';

import { useChat, useChatDispatch } from '@/providers/ChatProvider';

export default function Config() {
    const { activeThread, pluginsEnabled } = useChat();
    const dispatch = useChatDispatch();
    const availableTools: Tool[] = [
        'calculator',
        'search',
        'web-browser',
        'wikipedia-api',
    ];

    const modelInfo = [
        {
            label: 'Temperature',
            value: activeThread.agentConfig.temperature,
        },
        {
            label: 'Top P',
            value: activeThread.agentConfig.topP,
        },
        {
            label: 'N',
            value: activeThread.agentConfig.N,
        },
        {
            label: 'Max Tokens',
            value: activeThread.agentConfig.maxTokens,
        },
        {
            label: 'Frequency Penalty',
            value: activeThread.agentConfig.frequencyPenalty,
        },
        {
            label: 'Presence Penalty',
            value: activeThread.agentConfig.presencePenalty,
        },
    ];

    return (
        <div className="z-10 flex w-full max-w-lg flex-col justify-center gap-4 border border-neutral-600 bg-neutral-200 p-3 dark:bg-neutral-800">
            <label className="flex w-full flex-col justify-between gap-2 py-2 text-sm">
                <span>Name</span>
                <input
                    className="w-full rounded-lg border p-2"
                    type="text"
                    value={activeThread.agentConfig.name}
                    onChange={(e) => {
                        dispatch({
                            type: 'SET_SYSTEM_NAME',
                            payload: e.target.value,
                        });
                    }}
                />
            </label>
            <label className="flex w-full flex-col justify-between gap-2 py-2 text-sm">
                <span>System Message</span>
                <input
                    className="w-full rounded-lg border p-2"
                    type="text"
                    value={activeThread.agentConfig.systemMessage}
                    onChange={(e) => {
                        dispatch({
                            type: 'SET_SYSTEM_MESSAGE',
                            payload: e.target.value,
                        });
                    }}
                />
            </label>
            <details>
                <summary>Advanced</summary>
                {modelInfo.map((info) => (
                    <div
                        key={info.label}
                        className="flex w-full justify-between text-sm text-neutral-600 dark:text-neutral-400"
                    >
                        <div>{info.label}:</div>
                        <div>{info.value}</div>
                    </div>
                ))}
            </details>
            <div className="flex flex-col gap-2">
                <div className="flex flex-col px-1">
                    <div className="flex items-center justify-between gap-4 dark:border-neutral-600">
                        <div className="flex flex-col">
                            <div className="font-semibold ">Plugins</div>
                        </div>
                        <input
                            type="checkbox"
                            title="Toggle plugins"
                            className="h-4 w-4 cursor-pointer"
                            checked={pluginsEnabled}
                            onChange={() =>
                                dispatch({
                                    type: 'TOGGLE_PLUGINS',
                                })
                            }
                        />
                    </div>
                    {pluginsEnabled && (
                        <div className="text-xs text-neutral-600 dark:text-neutral-400">
                            {activeThread.agentConfig.tools.length} enabled
                        </div>
                    )}
                </div>
                <div>
                    {pluginsEnabled &&
                        availableTools.map((plugin) => {
                            const checked =
                                activeThread.agentConfig.tools.includes(plugin);
                            return (
                                <label
                                    key={plugin}
                                    className="flex w-full cursor-pointer items-center justify-between rounded p-1 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-600"
                                >
                                    <span className="capitalize">{plugin}</span>
                                    <input
                                        className="rounded-lg border p-2"
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => {
                                            dispatch({
                                                type: 'TOGGLE_PLUGIN',
                                                payload: plugin as Tool,
                                            });
                                        }}
                                    />
                                </label>
                            );
                        })}
                </div>
            </div>
        </div>
    );
}
