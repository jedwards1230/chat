import { ChatBubbleFunctionList } from './ChatBubbleFunctionList';
import TextContent from './TextContent';

export default function ChatBubble({
    message,
    input,
    config,
}: {
    message: Message;
    input?: string;
    config?: AgentConfig;
}) {
    return (
        <div>
            <TextContent message={message} input={input} config={config} />
            <ChatBubbleFunctionList message={message} />
        </div>
    );
}
