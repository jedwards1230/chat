'use client';

import { Button } from '@/components/ui/button';
import Markdown from './Markdown';
import { useState } from 'react';

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

    return (
        <div className="relative overflow-hidden p-2">
            {message.role === 'function' && (
                <FunctionDetails
                    message={message}
                    input={input}
                    content={content}
                />
            )}
            {message.role === 'system' && (
                <SystemContent message={message} config={config} />
            )}
            {message.role === 'assistant' && content && (
                <Markdown content={content} />
            )}
            {message.role === 'user' &&
                content &&
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
    input?: string;
    content: string | null;
}) {
    const [open, setOpen] = useState(false);
    const mdContent = `\`\`\`md\n${content}\n\`\`\``;

    return (
        <>
            <PreviewButton onClick={() => setOpen(!open)}>
                <div className="inline-block align-middle">{message.name}:</div>{' '}
                <div title={input} className="inline-block align-middle">
                    <Markdown content={input} />
                </div>
            </PreviewButton>
            {open && <DetailsContent content={mdContent} />}
        </>
    );
}

function FileDetails({ message }: { message: Message }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <PreviewButton onClick={() => setOpen(!open)}>
                <div className="inline-block align-middle">{message.name}</div>
            </PreviewButton>
            {open && <DetailsContent content={message.content || ''} />}
        </>
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
}: {
    children: React.ReactNode;
    onClick: () => void;
}) {
    return (
        <Button onClick={onClick} className="gap-2 text-ellipsis">
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
        <div className="flex w-full flex-col justify-start rounded text-sm text-neutral-400 dark:text-neutral-400">
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
