export default class ChatManager {
    static createMessage(
        message: Message,
        mapping: MessageMapping,
        current_node: string | null,
    ) {
        const id = message.id;

        const newMapping: MessageMapping = {
            ...mapping,
            [id]: {
                id,
                message,
                parent: current_node,
                children: [],
            },
        };

        if (current_node) {
            const parentNode = newMapping[current_node];
            newMapping[current_node] = {
                ...parentNode,
                children: [...parentNode.children, id],
            };
        }

        return { newMapping, newCurrentNode: id };
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
            throw new Error(
                `Message with ID ${message.id} does not exist in mapping ${mapping}`,
            );
        }

        return {
            ...mapping,
            [message.id]: {
                ...mapping[message.id],
                message,
            },
        };
    }

    static deleteMessage(id: string, mapping: MessageMapping): MessageMapping {
        const newMapping: MessageMapping = { ...mapping };

        const childMessage = newMapping[id];
        if (!childMessage) {
            return newMapping;
        }

        const parent = childMessage.parent;
        if (parent) {
            newMapping[parent].children = newMapping[parent].children.filter(
                (childId) => childId !== id,
            );
        }

        delete mapping[id];
        return newMapping;
    }

    static getOrderedMessages(
        current_node: string | null,
        mapping: MessageMapping,
    ): Message[] {
        const orderedMessages: Message[] = [];
        let currentNode = current_node;

        while (currentNode) {
            const childMessage = mapping[currentNode];

            if (childMessage.message) {
                orderedMessages.unshift(childMessage.message);
            }
            currentNode = childMessage.parent;
        }

        return orderedMessages;
    }

    static editMessageAndFork(
        id: string,
        alternateMessage: Message,
        mapping: MessageMapping,
    ): MessageMapping {
        const newMapping: MessageMapping = { ...mapping };

        const childMessage = newMapping[id];
        if (!childMessage) {
            throw new Error(`Message with ID ${id} does not exist`);
        }

        childMessage.message = alternateMessage;

        newMapping[alternateMessage.id] = {
            id: alternateMessage.id,
            message: alternateMessage,
            parent: id,
            children: [],
        };

        childMessage.children.push(alternateMessage.id);

        return newMapping;
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
