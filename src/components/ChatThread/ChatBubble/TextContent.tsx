import Markdown from './Markdown';

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

    const FunctionContent = () => {
        const mdContent = `\`\`\`md\n${content}\n\`\`\``;

        return (
            <details className="flex w-full flex-col items-start rounded">
                <summary className="w-full cursor-pointer gap-2 text-ellipsis rounded-lg p-2 hover:bg-neutral-300 dark:hover:bg-neutral-700">
                    <div className="inline-block align-middle">
                        {message.name}:
                    </div>{' '}
                    <div
                        title={input}
                        className="inline-block overflow-x-scroll align-middle"
                    >
                        <Markdown content={input} />
                    </div>
                </summary>
                <div className="mt-4">
                    <Markdown content={mdContent} />
                </div>
            </details>
        );
    };

    const SystemContent = () => {
        if (!config) return null;
        return (
            <div className="flex w-full flex-col justify-start rounded text-sm text-neutral-400 dark:text-neutral-400">
                <div>Model: {config.model}</div>
                <div>System Message: {message.content}</div>
                {config.toolsEnabled && config.tools.length > 0 && (
                    <div className="capitalize">
                        Plugins: {config.tools.join(' | ')}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex w-full flex-col overflow-x-scroll rounded px-2 py-2 transition-colors">
            {message.role === 'function' ? (
                <FunctionContent />
            ) : message.role === 'system' ? (
                <SystemContent />
            ) : (
                <Markdown content={content} />
            )}
        </div>
    );
}
