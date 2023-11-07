// ChatManager.test.ts

import ChatManager from './ChatManager';

describe('ChatManager', () => {
    const createMessage = (
        id: string,
        content: string,
        role: Role,
    ): Message => ({
        id,
        content,
        role,
    });

    let initialMessage: Message;
    let initialMapping: MessageMapping;

    beforeEach(() => {
        initialMessage = createMessage('1', 'Hello', 'user');
        initialMapping = {
            '1': {
                id: '1',
                message: initialMessage,
                parent: null,
                children: [],
            },
        };
    });

    test('createMessage', () => {
        const newMessage = createMessage('2', 'Hi', 'assistant');
        const { mapping, currentNode } = ChatManager.createMessage(
            newMessage,
            initialMapping,
            '1',
        );

        expect(mapping).toHaveProperty('2');
        expect(mapping['2']).toMatchObject({
            id: '2',
            message: newMessage,
            parent: '1',
            children: [],
        });
        expect(mapping['1'].children).toContain('2');
        expect(currentNode).toBe('2');
    });

    test('createMessage with existing id should throw error', () => {
        const newMessage = createMessage('1', 'Hi', 'assistant');
        expect(() => {
            ChatManager.createMessage(newMessage, initialMapping, '1');
        }).toThrow('ID 1 already exists in mapping');
    });

    test('readMessage', () => {
        const message = ChatManager.readMessage('1', initialMapping);
        expect(message).toEqual(initialMessage);
    });

    test('readMessage with non-existing id should return null', () => {
        const message = ChatManager.readMessage('999', initialMapping);
        expect(message).toBeNull();
    });

    test('updateMessage', () => {
        const updatedMessage = { ...initialMessage, content: 'Updated' };
        const newMapping = ChatManager.updateMessage(
            updatedMessage,
            initialMapping,
        );
        expect(newMapping['1'].message).toEqual(updatedMessage);
    });

    test('updateMessage with non-existing id should not alter mapping', () => {
        const updatedMessage = createMessage('999', 'Updated', 'user');
        const newMapping = ChatManager.updateMessage(
            updatedMessage,
            initialMapping,
        );
        expect(newMapping).toEqual(initialMapping);
    });

    test('deleteMessage', () => {
        const { updatedMapping, newCurrentNode } = ChatManager.deleteMessage(
            '1',
            initialMapping,
            '1',
        );
        expect(updatedMapping['1']).toBeUndefined();
        expect(newCurrentNode).toBeNull();
    });

    test('deleteMessage with children re-parenting', () => {
        const childMessage = createMessage('2', 'Child', 'user');
        const updatedMapping = ChatManager.createMessage(
            childMessage,
            initialMapping,
            '1',
        ).mapping;
        const { updatedMapping: finalMapping } = ChatManager.deleteMessage(
            '1',
            updatedMapping,
            '2',
        );

        expect(finalMapping['1']).toBeUndefined();
        expect(finalMapping['2'].parent).toBeNull();
    });

    test('deleteMessage with non-existing id should not alter mapping or current node', () => {
        const { updatedMapping, newCurrentNode } = ChatManager.deleteMessage(
            '999',
            initialMapping,
            '1',
        );
        expect(updatedMapping).toEqual(initialMapping);
        expect(newCurrentNode).toBe('1');
    });

    test('upsertMessage when creating new message', () => {
        const newMessage = createMessage('2', 'Hi', 'assistant');
        const { mapping } = ChatManager.upsertMessage(
            newMessage,
            initialMapping,
            '1',
        );
        expect(mapping['2']).toMatchObject({
            id: '2',
            message: newMessage,
            parent: '1',
            children: [],
        });
    });

    test('upsertMessage when updating existing message', () => {
        const updatedMessage = { ...initialMessage, content: 'Updated' };
        const { mapping } = ChatManager.upsertMessage(
            updatedMessage,
            initialMapping,
            '1',
        );
        expect(mapping['1'].message).toEqual(updatedMessage);
    });

    test('getOrderedMessages', () => {
        const secondMessage = createMessage('2', 'Reply', 'assistant');
        const { mapping } = ChatManager.createMessage(
            secondMessage,
            initialMapping,
            '1',
        );
        const orderedMessages = ChatManager.getOrderedMessages('2', mapping);
        expect(orderedMessages).toEqual([initialMessage, secondMessage]);
    });

    test('getOrderedMessages with non-existing current node should return empty array', () => {
        const orderedMessages = ChatManager.getOrderedMessages(
            '999',
            initialMapping,
        );
        expect(orderedMessages).toEqual([]);
    });

    test('prepareMessageHistory', () => {
        const secondMessage = createMessage('2', 'Reply', 'assistant');
        secondMessage.name = 'Bot';
        const { mapping } = ChatManager.createMessage(
            secondMessage,
            initialMapping,
            '1',
        );
        const history = ChatManager.prepareMessageHistory('2', mapping);
        expect(history).toEqual([
            { ...initialMessage, name: undefined },
            { ...secondMessage, name: 'Bot' },
        ]);
    });

    test('editMessageAndFork', () => {
        const alternateMessage = createMessage('3', 'Alternate', 'assistant');
        const { mapping } = ChatManager.editMessageAndFork(
            '1',
            alternateMessage,
            initialMapping,
        );
        // be empty
        expect(mapping['1'].children).toEqual([]);
        expect(mapping['1'].parent).toEqual(mapping['3'].parent);
        expect(mapping['3'].message).toEqual(alternateMessage);
    });

    test('getSystemMessage', () => {
        const systemMessage = createMessage('0', 'System', 'system');
        const { mapping, currentNode } = ChatManager.createMessage(
            systemMessage,
            initialMapping,
            null,
        );
        const retrievedSystemMessage = ChatManager.getSystemMessage(
            currentNode,
            mapping,
        );
        expect(retrievedSystemMessage).toEqual(systemMessage);
    });

    test('clearChat', () => {
        initialMessage = createMessage(
            '1',
            'You are a personal Assistant',
            'system',
        );
        initialMapping = {
            '1': {
                id: '1',
                message: initialMessage,
                parent: null,
                children: ['2'],
            },
            '2': {
                id: '2',
                message: createMessage('2', 'How are you?', 'user'),
                parent: '1',
                children: [],
            },
        };

        const { mapping, currentNode } = ChatManager.clearChat(initialMapping);
        expect(mapping).toEqual({
            '1': {
                id: '1',
                message: initialMessage,
                parent: null,
                children: [],
            },
        });
        expect(currentNode).toBe('1');
    });

    test('clearChat without system message', () => {
        const { mapping, currentNode } = ChatManager.clearChat(initialMapping);
        expect(mapping).toEqual({});
        expect(currentNode).toBeNull();
    });

    test('regenerateAndFork from user message', () => {
        const userMessage = createMessage('2', 'User message', 'user');
        const { mapping: updatedMapping } = ChatManager.createMessage(
            userMessage,
            initialMapping,
            '1',
        );
        const { mapping: forkedMapping, currentNode } =
            ChatManager.regenerateAndFork('2', updatedMapping);

        expect(forkedMapping[currentNode!]).toBeDefined();
        const parent = forkedMapping[currentNode!].parent;

        expect(forkedMapping[parent!].children).toContain(currentNode!);
    });

    /* test('regenerateAndFork from undefined message should regenerate from the most recent user message', () => {
        const userMessage = createMessage('2', 'Second user message', 'user');
        const assistantMessage = createMessage(
            '3',
            'Assistant message',
            'assistant',
        );

        initialMapping = {
            '1': {
                id: '1',
                message: initialMessage,
                parent: null,
                children: ['2'],
            },
            '2': {
                id: '2',
                message: userMessage,
                parent: '1',
                children: ['3'],
            },
            '3': {
                id: '3',
                message: assistantMessage,
                parent: '2',
                children: [],
            },
        };

        const { mapping: forkedMapping, currentNode } =
            ChatManager.regenerateAndFork('3', initialMapping);

        expect(forkedMapping[currentNode!]).toBeDefined();
        expect(forkedMapping[currentNode!].message).toEqual(
            expect.objectContaining(userMessage),
        );
    }); */
});
