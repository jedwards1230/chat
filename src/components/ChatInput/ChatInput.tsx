'use client';

import { useEffect, useRef, useState, memo } from 'react';

import { useChat } from '@/providers/ChatProvider';
import QuickActions from './QuickActions';
import { isMobile } from '@/utils/client/device';
import { calculateRows } from '@/utils';
import { getTokenCount } from '@/utils/tokenizer';
import { Textarea } from '../ui/textarea';
import { EditButtons, SubmitButton } from './Buttons';
import CommandOverlay from './CommandOverlay';
import FileUpload from './FileUpload';

function ChatInput() {
    const {
        activeThread,
        defaultThread,
        input,
        editId,
        changeInput,
        handleSubmit,
    } = useChat();

    const thread = activeThread || defaultThread;
    const [activeId, setActiveId] = useState<string>(thread.id);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const [tokenCount, setTokenCount] = useState(0);

    useEffect(() => {
        (async () => {
            const count = await getTokenCount(input);
            setTokenCount(count);
        })();
    }, [input]);

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
                        <FileUpload thread={thread} />
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
