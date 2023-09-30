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

        let inputDisplay = input;
        if (message.name === 'web-browser' && input) {
            const { url, task } = JSON.parse(input);
            if (task) {
                inputDisplay = `[${task}](${url})`;
            } else {
                inputDisplay = url;
            }
        }

        return (
            <details className="flex flex-col items-start w-full rounded">
                <summary className="w-full gap-2 p-2 capitalize rounded-lg cursor-pointer text-ellipsis hover:bg-neutral-300 dark:hover:bg-neutral-700">
                    <div className="inline-block align-middle">
                        {message.name}:
                    </div>{' '}
                    <div
                        title={inputDisplay}
                        className="inline-block overflow-x-scroll align-middle"
                    >
                        <Markdown content={inputDisplay} />
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
            <div className="flex flex-col justify-start w-full text-sm rounded text-neutral-400 dark:text-neutral-400">
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
        <div className="flex flex-col w-full px-2 py-2 overflow-x-scroll transition-colors rounded">
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
