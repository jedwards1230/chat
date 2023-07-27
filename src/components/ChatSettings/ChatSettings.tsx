'use client';

import clsx from 'clsx';
import { useEffect, useRef } from 'react';

import { useChat } from '@/providers/ChatProvider';
import { shareChatThread } from '@/utils/server';
import { Share } from '../Icons';
import { isMobile } from '@/utils/client';
import { useUI } from '@/providers/UIProvider';

export default function ChatSettings() {
    const {
        activeThread,
        pluginsEnabled,
        setPluginsEnabled,
        toggleplugin,
        setSystemMessage,
        updateThreadConfig,
    } = useChat();
    const { chatSettingsOpen, setChatSettingsOpen, setShareModalOpen } =
        useUI();
    const chatsettingsRef = useRef<HTMLDivElement>(null);

    const togglePlugins = () => {
        setPluginsEnabled(!pluginsEnabled);
    };

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

    const handleShare = async () => {
        try {
            await shareChatThread(activeThread);
            setShareModalOpen(true);
            if (isMobile()) {
                setChatSettingsOpen(false);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (
                chatSettingsOpen &&
                isMobile('md') &&
                chatsettingsRef.current &&
                !chatsettingsRef.current.contains(event.target)
            ) {
                event.preventDefault();
                setChatSettingsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            ref={chatsettingsRef}
            className={clsx(
                'fixed right-0 z-50 h-full w-72 min-w-[270px] max-w-xs border-l bg-neutral-800 py-2 text-neutral-100 transition-all dark:border-neutral-500 sm:z-auto lg:inset-y-0 lg:flex',
                chatSettingsOpen ? 'translate-x-0' : 'translate-x-full',
            )}
        >
            <div className="flex h-full w-full flex-col pb-6 md:pb-0">
                <div className="relative flex h-full w-full flex-1 flex-col items-center justify-start gap-2 px-2">
                    <label className="flex w-full flex-col justify-between gap-2 py-2 text-sm">
                        <span>Name</span>
                        <input
                            className="w-full rounded-lg border bg-neutral-700 p-2"
                            type="text"
                            value={activeThread.agentConfig.name}
                            onChange={(e) =>
                                updateThreadConfig({ name: e.target.value })
                            }
                        />
                    </label>
                    <label className="flex w-full flex-col justify-between gap-2 py-2 text-sm">
                        <span>System Message</span>
                        <input
                            className="w-full rounded-lg border bg-neutral-700 p-2"
                            type="text"
                            value={activeThread.agentConfig.systemMessage}
                            onChange={(e) => setSystemMessage(e.target.value)}
                        />
                    </label>
                    <details className="w-full">
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
                                    checked={pluginsEnabled}
                                    onChange={togglePlugins}
                                />
                            </div>
                            {pluginsEnabled && (
                                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                                    {activeThread.agentConfig.tools.length}{' '}
                                    enabled
                                </div>
                            )}
                        </label>
                        <div>
                            {pluginsEnabled &&
                                availableTools.map((plugin) => {
                                    const checked =
                                        activeThread.agentConfig.tools.includes(
                                            plugin,
                                        );
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
                                                    toggleplugin(plugin)
                                                }
                                            />
                                        </label>
                                    );
                                })}
                        </div>
                    </div>
                </div>
                {activeThread.messages.length > 1 && (
                    <button
                        className="mx-2 flex items-center justify-center rounded-lg border border-neutral-500 py-2 font-medium transition-colors hover:border-neutral-400 hover:bg-neutral-600 dark:hover:bg-neutral-700"
                        onClick={handleShare}
                    >
                        Share{' '}
                        <span className="scale-[60%]">
                            <Share />
                        </span>
                    </button>
                )}
            </div>
        </div>
    );
}