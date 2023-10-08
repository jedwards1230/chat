'use client';

import { useEffect, useMemo, useRef, useState, memo, ChangeEvent } from 'react';

import { useChat } from '@/providers/ChatProvider';
import QuickActions from '../QuickActions';
import { isMobile } from '@/utils/client/device';
import { calculateRows } from '@/utils';
import { getTokenCount } from '@/utils/tokenizer';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { createMessage } from '@/utils/client/chat';
import { EditButtons, SubmitButton } from './Buttons';
import CommandOverlay from './CommandOverlay';

function ChatInput() {
    const {
        activeThread,
        defaultThread,
        input,
        editId,
        addMessage,
        changeInput,
        handleSubmit,
    } = useChat();

    const thread = activeThread || defaultThread;
    const [activeId, setActiveId] = useState<string>(thread.id);
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
                if (file.type.startsWith('text/') || file.type === '') {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const contents = e.target?.result;
                        if (contents) {
                            const content =
                                typeof contents === 'string'
                                    ? contents
                                    : contents.toString();

                            const fileExtension =
                                file.name.split('.').pop() || 'txt';

                            const message = createMessage({
                                role: 'user',
                                name: file.name,
                                content: `\`\`\`${fileExtension}\n// ${file.name}\n\n${content}\n\`\`\``,
                            });

                            addMessage(message, thread);
                        }
                    };
                    reader.readAsText(file);
                } else {
                    console.log('Unsupported file type', file.type);
                }
            }
        }
    };

    useEffect(() => {
        if (thread.id !== activeId) {
            setActiveId(thread.id);
            inputRef.current?.focus();
        }
    }, [activeId, thread.id]);

    return (
        <div className="relative w-full">
            <QuickActions />
            <form
                onSubmit={handleSubmit}
                className="flex w-full items-end justify-center gap-2 justify-self-end border-t border-border px-4 pb-6 pt-4 shadow-xl transition-all dark:shadow-none sm:pb-4 md:pb-2 md:pt-2"
            >
                <div className="relative flex w-full max-w-4xl flex-col gap-2">
                    {activeCommand && (
                        <CommandOverlay
                            activeCommand={activeCommand}
                            activeThread={thread}
                        />
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
                                config={thread.agentConfig}
                            />
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}

export default memo(ChatInput);
