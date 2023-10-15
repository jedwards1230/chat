import { useMemo } from 'react';
import ChatManager from './ChatManager';

const useMessages = (
    currentNode: string | null | undefined = null,
    mapping: MessageMapping | undefined = {},
) => {
    const messages = useMemo(() => {
        return ChatManager.getOrderedMessages(currentNode || null, mapping);
    }, [currentNode, mapping]);

    return messages;
};

export default useMessages;
