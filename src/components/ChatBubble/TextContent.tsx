'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Trash } from '../Icons';
import Markdown from './Markdown';
import { parseInput } from '@/tools/utils';
import { useChat } from '@/providers/ChatProvider';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../ui/dialog';

export default function TextContent({
    message,
    input,
    config,
}: {
    message: Message;
    input?: string;
    config?: AgentConfig;
}) {
    const content =
        message.name && message.role !== 'function'
            ? `${message.name[0].toUpperCase() + message.name.substring(1)}: ${
                  message.content
              }`
            : message.content;

    const showFunctionDetails = message.role === 'function';
    const showSystemMessage = message.role === 'system';
    const showAssistantMessage = message.role === 'assistant' && content;
    const showUserMessage = message.role === 'user' && content;

    return (
        <div className="relative p-2 overflow-hidden">
            {showFunctionDetails && (
                <FunctionDetails
                    message={message}
                    input={input}
                    content={content}
                />
            )}
            {showSystemMessage && (
                <SystemContent message={message} config={config} />
            )}
            {showAssistantMessage && <Markdown content={content} />}
            {showUserMessage &&
                (message.name !== undefined ? (
                    <FileDetails message={message} />
                ) : (
                    <Markdown content={content} />
                ))}
        </div>
    );
}

function FunctionDetails({
    message,
    input,
    content,
}: {
    message: Message;
    input?: any;
    content: string | null;
}) {
    const { botTyping } = useChat();
    const [open, setOpen] = useState(false);
    const mdContent = `\`\`\`md\n${content}\n\`\`\``;
    const parsedInput = parseInput(input, message.name as Tool);

    return (
        <>
            <PreviewButton
                loading={!content && botTyping}
                onClick={() => setOpen(!open)}
            >
                <div className="inline-block align-middle">{message.name}:</div>{' '}
                <div title={parsedInput} className="inline-block align-middle">
                    <Markdown content={parsedInput} />
                </div>
            </PreviewButton>
            {open && content && <DetailsContent content={mdContent} />}
        </>
    );
}

function FileDetails({ message }: { message: Message }) {
    const { removeMessage } = useChat();
    return (
        <Dialog>
            <DialogTrigger asChild>
                <PreviewButton>
                    <div className="inline-block align-middle">
                        {message.name}
                    </div>
                </PreviewButton>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] w-full max-w-3xl overflow-y-scroll">
                <DialogHeader>
                    <div className="flex gap-4">
                        <div>
                            <DialogTitle>{message.name}</DialogTitle>
                            <DialogDescription>File Upload</DialogDescription>
                        </div>
                        <button onClick={() => removeMessage(message.id)}>
                            <Trash />
                        </button>
                    </div>
                </DialogHeader>
                <DetailsContent content={message.content || ''} />
            </DialogContent>
        </Dialog>
    );
}

function DetailsContent({ content }: { content: string }) {
    return (
        <Markdown
            className="mt-4 animate-in fade-in slide-in-from-top-6 [&>pre]:whitespace-pre-wrap"
            content={content || ''}
        />
    );
}

function PreviewButton({
    children,
    onClick,
    loading = false,
}: {
    children: React.ReactNode;
    onClick?: () => void;
    loading?: boolean;
}) {
    return (
        <Button
            variant={loading ? 'functionPreviewLoading' : 'functionPreview'}
            onClick={onClick}
            className="gap-2 transition-all text-ellipsis rounded-xl"
        >
            {children}
        </Button>
    );
}

function SystemContent({
    config,
    message,
}: {
    config?: AgentConfig;
    message: Message;
}) {
    if (!config) return null;
    return (
        <div className="flex flex-col justify-start w-full text-sm rounded text-neutral-400 dark:text-neutral-400">
            <div>Model: {config.model.name}</div>
            <div>System Message: {message.content}</div>
            {config.toolsEnabled && config.tools.length > 0 && (
                <div className="capitalize">
                    Plugins: {config.tools.join(' | ')}
                </div>
            )}
        </div>
    );
}
