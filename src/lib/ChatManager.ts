import { v4 as uuid } from 'uuid';

export default class ChatManager {
    static createMessage(
        message: Message,
        mapping: MessageMapping,
        current_node: string | null,
    ): MessagesState {
        const id = message.id;

        const updateCurrentNode = (current_node: string) => {
            const node = mapping[current_node];
            if (node.children.includes(id)) {
                throw new Error(
                    `ID ${id} already exists in children of current_node`,
                );
            }
            return {
                [current_node]: {
                    ...node,
                    children: [...node.children, id],
                },
            };
        };

        const newMapping: MessageMapping = {
            ...mapping,
            ...(current_node && updateCurrentNode(current_node)),
            [id]: {
                id,
                message,
                parent: current_node,
                children: [],
            },
        };

        return { mapping: newMapping, currentNode: id };
    }

    static upsertMessage(
        message: Message,
        mapping: MessageMapping,
        current_node: string | null,
    ): MessagesState {
        if (mapping[message.id]) {
            return {
                mapping: ChatManager.updateMessage(message, mapping),
                currentNode: current_node,
            };
        } else {
            return ChatManager.createMessage(message, mapping, current_node);
        }
    }

    static readMessage(id: string, mapping: MessageMapping): Message | null {
        const childMessage = mapping[id];
        return childMessage ? childMessage.message : null;
    }

    static updateMessage(
        message: Message,
        mapping: MessageMapping,
    ): MessageMapping {
        if (!mapping[message.id]) {
            return mapping;
        }
        return {
            ...mapping,
            [message.id]: {
                ...mapping[message.id],
                message,
            },
        };
    }

    static findEndmostNode(id: string, mapping: MessageMapping): string {
        let currentNode = id;
        while (mapping[currentNode].children.length > 0) {
            currentNode = mapping[currentNode].children[0];
        }
        return currentNode;
    }

    static deleteMessage(
        id: string,
        mapping: MessageMapping,
        currentNode: string | null,
    ): { updatedMapping: MessageMapping; newCurrentNode: string | null } {
        const updatedMapping: MessageMapping = { ...mapping };

        const messageToDelete = updatedMapping[id];
        if (!messageToDelete) {
            return { updatedMapping, newCurrentNode: currentNode };
        }
        const parent = messageToDelete.parent;
        if (parent) {
            // Remove the node from its parent's children
            updatedMapping[parent].children = updatedMapping[
                parent
            ].children.filter((childId) => childId !== id);
            // Assign the node's children to its parent
            messageToDelete.children.forEach((childId) => {
                if (updatedMapping[childId]) {
                    updatedMapping[childId].parent = parent;
                    updatedMapping[parent].children.push(childId);
                }
            });
        }
        delete updatedMapping[id];

        // Update current node
        let newCurrentNode = currentNode;
        if (currentNode === id) {
            // If the deleted message is the current node
            newCurrentNode = parent; // Set the parent as the new current node
        }

        return { updatedMapping, newCurrentNode };
    }

    static getOrderedMessages(
        current_node: string | null,
        mapping: MessageMapping,
    ): Message[] {
        const orderedMessages: Message[] = [];
        let currentNode = current_node;

        while (currentNode) {
            const childMessage = mapping[currentNode];
            if (!childMessage) {
                break;
            }
            if (childMessage.message) {
                orderedMessages.unshift(childMessage.message);
            }
            currentNode = childMessage.parent;
        }

        return orderedMessages;
    }

    static prepareMessageHistory(
        current_node: string | null,
        mapping: MessageMapping,
    ): Message[] {
        const orderedMessages = ChatManager.getOrderedMessages(
            current_node,
            mapping,
        );
        return orderedMessages.map((message) => {
            return {
                ...message,
                name: message.role === 'user' ? undefined : message.name,
            };
        });
    }

    static editMessageAndFork(
        id: string,
        alternateMessage: Message,
        mapping: MessageMapping,
    ): MessagesState {
        const newMapping: MessageMapping = { ...mapping };

        const originalMessage = newMapping[id];
        if (!originalMessage) {
            throw new Error(`Message with ID ${id} does not exist`);
        }

        // Check if the alternateMessage id does not already exist in the mapping
        if (newMapping[alternateMessage.id]) {
            alternateMessage.id = uuid();
        }

        newMapping[alternateMessage.id] = {
            id: alternateMessage.id,
            message: alternateMessage,
            parent: originalMessage.parent, // same parent as original message
            children: [],
        };

        // Add the new message to the parent's list of children
        if (originalMessage.parent) {
            newMapping[originalMessage.parent].children.push(
                alternateMessage.id,
            );
        }

        return { mapping: newMapping, currentNode: alternateMessage.id };
    }

    static getSystemMessage(
        current_node: string | null,
        mapping: MessageMapping,
    ): Message | null {
        let rootNode = current_node;

        while (rootNode) {
            const parent = mapping[rootNode]?.parent;
            if (!parent) {
                break;
            }
            rootNode = parent;
        }

        if (rootNode && mapping[rootNode]?.message) {
            return mapping[rootNode].message;
        }

        return null;
    }
}
