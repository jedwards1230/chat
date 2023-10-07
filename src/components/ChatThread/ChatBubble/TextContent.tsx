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
        <div className="p-2">
            {message.role === 'function' && (
                <FunctionContent
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
                    <FileContent message={message} />
                ) : (
                    <Markdown content={content} />
                ))}
        </div>
    );
}

function FunctionContent({
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
            <FunctionPreview
                name={message.name}
                input={input}
                onClick={() => setOpen(!open)}
            />
            {open && (
                <Markdown
                    className="mt-4 [&>pre]:whitespace-pre-wrap"
                    content={mdContent}
                />
            )}
        </>
    );
}

function FileContent({ message }: { message: Message }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <FilePreview message={message} onClick={() => setOpen(!open)} />
            {open && (
                <Markdown
                    className="mt-4 [&>pre]:whitespace-pre-wrap"
                    content={message.content || ''}
                />
            )}
        </>
    );
}

function FilePreview({
    message,
    onClick,
}: {
    message: Message;
    onClick: () => void;
}) {
    return (
        <Button onClick={onClick} className="gap-2 text-ellipsis">
            <div className="inline-block align-middle">{message.name}</div>
        </Button>
    );
}

function FunctionPreview({
    name,
    input,
    onClick,
}: {
    name?: string;
    input?: string;
    onClick: () => void;
}) {
    return (
        <Button onClick={onClick} className="gap-2 text-ellipsis">
            <div className="inline-block align-middle">{name}:</div>{' '}
            <div title={input} className="inline-block align-middle">
                <Markdown content={input} />
            </div>
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
