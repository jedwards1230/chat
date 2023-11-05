import { useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { ChatBubbleFunctionList } from './ChatBubbleFunctionList';
import TextContent from './TextContent';
import { useChat } from '@/providers/ChatProvider';

export default function ChatBubble({
    message,
    input,
    config,
}: {
    message: Message;
    input?: string;
    config?: AgentConfig;
}) {
    if (message.role === 'assistant' && message.function_call) return null;
    if (message.content === '') return null;
    return (
        <div className="flex flex-col">
            <BranchSwitcher message={message} />
            <TextContent message={message} input={input} config={config} />
            <ChatBubbleFunctionList message={message} />
        </div>
    );
}

function BranchSwitcher({ message }: { message: Message }) {
    const { activeThread, changeBranch } = useChat();
    const mapping = activeThread!.mapping;

    // Store parent of the message
    const parent = mapping[message.id]?.parent;

    // Determine if the message has siblings
    const hasSiblings = parent && (mapping[parent]?.children.length ?? 0) > 1;

    // Get sibling nodes
    const siblingNodes = useMemo(
        () => (parent ? mapping[parent]?.children : []),
        [parent, mapping],
    );

    // Get index of current message in siblings
    const currentIndex = siblingNodes.indexOf(message.id);

    // Create function to handle branch switching
    const handleSwitchBranch = useCallback(
        (offset: number) => {
            if (!parent) return;

            // Calculate new index with offset
            const newIndex = currentIndex + offset;

            // Fetch new sibling
            const newSibling = siblingNodes[newIndex];

            // Update current node
            if (newSibling) {
                changeBranch(newSibling);
            }
        },
        [parent, currentIndex, siblingNodes, changeBranch],
    );

    if (!hasSiblings) return null;
    return (
        <div className="flex shrink-0 items-center text-sm">
            <button
                disabled={currentIndex === 0}
                onClick={() => handleSwitchBranch(-1)}
                className="transition-all disabled:opacity-20"
            >
                <ChevronLeft />
            </button>
            <span>
                {currentIndex + 1} / {siblingNodes.length}
            </span>
            <button
                disabled={siblingNodes[currentIndex + 1] === undefined}
                onClick={() => handleSwitchBranch(1)}
                className="transition-all disabled:opacity-20"
            >
                <ChevronRight />
            </button>
        </div>
    );
}
