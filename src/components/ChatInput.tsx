'use client';

import { useEffect, useMemo, useRef, useState, memo, ChangeEvent } from 'react';

import { useChat } from '@/providers/ChatProvider';
import QuickActions from './QuickActions';
import { isMobile } from '@/utils/client/device';
import { calculateRows } from '@/utils';
import { baseCommands } from '@/tools/commands';
import { getTokenCount } from '@/utils/tokenizer';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { createMessage } from '@/utils/client/chat';

type ToolCommand = {
    command: Command;
    tool: Tool;
};

function ChatInput() {
    const {
        currentThread,
        defaultThread,
        threads,
        input,
        editId,
        addMessage,
        changeInput,
        handleSubmit,
    } = useChat();

    const activeThread =
        currentThread !== null ? threads[currentThread] : defaultThread;
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

    const onFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        console.log(e.target.files);
        if (files) {
            for (const file of files) {
                switch (file.type) {
                    case 'text/markdown':
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const contents = e.target?.result;
                            if (contents) {
                                const content =
                                    typeof contents === 'string'
                                        ? contents
                                        : contents.toString();
                                const message = createMessage({
                                    role: 'user',
                                    name: file.name,
                                    content: `\`\`\`markdown\n// ${file.name}\n\n${content}\n\`\`\``,
                                });

                                addMessage(message, activeThread);
                            }
                        };
                        reader.readAsText(file);
                        break;
                    default:
                        console.log('Unsupported file type', file.type);
                        break;
                }
            }
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
                className="flex w-full items-end justify-center gap-2 justify-self-end border-t border-border px-4 pb-6 pt-4 shadow-xl transition-all dark:shadow-none sm:pb-4 md:pb-2 md:pt-2"
            >
                <div className="relative flex w-full max-w-4xl flex-col gap-2">
                    {activeCommand && availableCommands.length > 0 && (
                        <div className="rounded-rounded border border-border p-1 animate-in fade-in-50 slide-in-from-bottom-8">
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
                    <div className="flex gap-1 sm:gap-2">
                        <Button
                            className="text-xl font-bold"
                            variant="outline"
                            size="icon"
                            onClick={() =>
                                document.getElementById('fileInput')?.click()
                            }
                        >
                            +
                        </Button>
                        <Input
                            id="fileInput"
                            className="hidden"
                            type="file"
                            multiple
                            onChange={onFileUpload}
                        />
                        <Textarea
                            variant="blue"
                            ref={inputRef}
                            placeholder="Say something..."
                            value={input}
                            onClick={(e) => inputRef.current?.focus()}
                            rows={rows}
                            onChange={(e) => changeInput(e.target.value)}
                            onKeyDown={onKeyDownHandler}
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
                variant={input.length > 0 ? 'primaryBlue' : 'default'}
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
        <div className="flex flex-col justify-end gap-1 p-1">
            <Button size="sm" variant="primaryBlue" onClick={handleSubmit}>
                Update
            </Button>
            <Button size="sm" onClick={cancelEdit}>
                Cancel
            </Button>
        </div>
    );
}

export default memo(ChatInput);
