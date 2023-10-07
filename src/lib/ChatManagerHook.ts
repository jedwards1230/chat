import { useMemo } from 'react';
import ChatManager from './ChatManager';

const useMessages = (
    current_node: string | null | undefined = null,
    mapping: MessageMapping | undefined = {},
) => {
    const messages = useMemo(() => {
        return ChatManager.getOrderedMessages(current_node || null, mapping);
    }, [current_node, mapping]);

    return messages;
};

export default useMessages;
