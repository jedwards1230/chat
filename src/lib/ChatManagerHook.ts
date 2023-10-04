import { useMemo } from 'react';
import ChatManager from './ChatManager';

const useMessages = (current_node: string | null, mapping: MessageMapping) => {
    const messages = useMemo(() => {
        return ChatManager.getOrderedMessages(current_node, mapping);
    }, [current_node, mapping]);

    return messages;
};

export default useMessages;
