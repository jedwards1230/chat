'use client';

import { useEffect, useMemo, useRef, useState, memo } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

import { useChat } from '@/providers/ChatProvider';
import QuickActions from './QuickActions';
import { isMobile } from '@/utils/client/device';
import { calculateRows } from '@/utils';
import { baseCommands } from '@/tools/commands';
import { getTokenCount } from '@/utils/tokenizer';
import { Button } from './ui/button';

type ToolCommand = {
    command: Command;
    tool: Tool;
};

function ChatInput() {
    const { activeThread, input, editId, changeInput, handleSubmit } =
        useChat();

    const [activeId, setActiveId] = useState<string>(activeThread.id);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const tokenCount = useMemo(() => getTokenCount(input), [input]);

    const rows = calculateRows(input);

    const activeCommand = input.startsWith('/')
        ? (input.split(' ')[0] as Command)
        : undefined;

    const onKeyDownHandler = (e: any) => {
        if (e.key === 'Enter' && !e.shiftKey && !isMobile()) {
            e.preventDefault();
            changeInput(e.target.value);
            handleSubmit(e);
        }
    };

    useEffect(() => {
        if (activeThread.id !== activeId) {
            setActiveId(activeThread.id);
            inputRef.current?.focus();
        }
    }, [activeId, activeThread.id]);

    const commands = useMemo(
        () =>
            !activeThread.agentConfig.toolsEnabled
                ? []
                : Object.keys(baseCommands).reduce((acc, command) => {
                      const com = command as Command;
                      if (
                          activeThread.agentConfig.tools.includes(
                              baseCommands[com],
                          )
                      ) {
                          acc.push({ command: com, tool: baseCommands[com] });
                      }
                      return acc;
                  }, [] as ToolCommand[]),
        [activeThread.agentConfig.tools, activeThread.agentConfig.toolsEnabled],
    );

    const availableCommands = useMemo(
        () =>
            activeCommand
                ? commands.filter((tool) =>
                      tool.command.includes(activeCommand),
                  )
                : commands,
        [activeCommand, commands],
    );

    return (
        <div className="relative w-full">
            <QuickActions />
            <form
                onSubmit={handleSubmit}
                className="flex items-end justify-center w-full gap-2 px-4 pt-4 pb-6 transition-all border-t shadow-xl justify-self-end border-border dark:shadow-none sm:pb-4 md:pb-2 md:pt-2"
            >
                <div className="relative flex flex-col w-full max-w-4xl gap-2">
                    {activeCommand && availableCommands.length > 0 && (
                        <div className="p-1 border rounded-rounded border-border animate-in fade-in-50 slide-in-from-bottom-8">
                            {availableCommands.map((tool, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 rounded-lg px-4 py-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-50 dark:focus:ring-blue-500 dark:focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
                                >
                                    <div>{tool.command}</div>
                                    <div className="text-sm text-neutral-400">
                                        {tool.tool}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex gap-1">
                        <motion.textarea
                            ref={inputRef}
                            placeholder="Say something..."
                            value={input}
                            onClick={(e) => inputRef.current?.focus()}
                            rows={rows}
                            onChange={(e) => changeInput(e.target.value)}
                            onKeyDown={onKeyDownHandler}
                            className="flex-1 w-full py-2 pl-2 pr-24 transition-colors border-2 rounded-lg shadow resize-none border-border bg-background focus:border-blue-primary focus:outline-none dark:bg-accent"
                        />
                        {editId ? (
                            <EditButtons />
                        ) : (
                            <SubmitButton
                                tokenCount={tokenCount}
                                input={input}
                                config={activeThread.agentConfig}
                            />
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}

function SubmitButton({
    tokenCount,
    input,
    config,
}: {
    input: string;
    tokenCount: number;
    config: AgentConfig;
}) {
    const maxTokens = config.model.params?.maxTokens || 0;
    return (
        <div className="flex flex-col justify-end gap-1 p-1">
            {tokenCount > 0 && (
                <div className="text-sm" title="Token Count">
                    <span>{tokenCount}</span>
                    {maxTokens > 0 && <span>/ {maxTokens}</span>}
                </div>
            )}
            <Button
                size="sm"
                className={clsx(
                    'transition-colors',
                    input.length > 0
                        ? 'cursor-pointer bg-blue-primary text-background hover:bg-blue-primary/80 focus:border-blue-primary focus:bg-blue-primary/90'
                        : 'cursor-default text-background dark:text-foreground',
                )}
                type="submit"
            >
                Send
            </Button>
        </div>
    );
}

function EditButtons() {
    const { handleSubmit, cancelEdit } = useChat();

    return (
        <div className="flex justify-between gap-4 pt-2">
            <button
                className="rounded-lg border border-transparent bg-blue-primary px-6 py-1.5 transition-colors hover:bg-blue-primary/70 focus:border-blue-primary focus:bg-blue-primary focus:outline-none"
                onClick={handleSubmit}
            >
                Update and Regenerate
            </button>
            {/* <button
        className="rounded-lg border border-transparent bg-green-500 px-6 py-1.5 text-neutral-50 transition-colors hover:bg-green-400 focus:border-green-500 focus:bg-green-400 focus:outline-none dark:bg-green-500 dark:hover:bg-green-400"
        onClick={handleSubmit}
    >
        Replace Only
    </button> */}
            <button
                className="rounded-lg border border-transparent bg-neutral-300 px-6 py-1.5 transition-colors hover:bg-neutral-400 focus:border-blue-500 focus:bg-neutral-400 focus:outline-none dark:bg-neutral-500 dark:hover:bg-neutral-400"
                onClick={cancelEdit}
            >
                Cancel
            </button>
        </div>
    );
}

export default memo(ChatInput);
