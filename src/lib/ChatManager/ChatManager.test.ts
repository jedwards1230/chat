import ChatManager from '.';

describe('ChatManager', () => {
    let initialMapping: MessageMapping;
    let initialMessage: Message;

    beforeEach(() => {
        initialMessage = {
            id: '1',
            content: 'Hello',
            role: 'user',
        };
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
        const newMessage: Message = {
            id: '2',
            content: 'Hi',
            role: 'assistant',
        };
        const { mapping: newMapping, currentNode: newCurrentNode } =
            ChatManager.createMessage(newMessage, initialMapping, '1');
        expect(newMapping['2']).toEqual({
            id: '2',
            message: newMessage,
            parent: '1',
            children: [],
        });
        expect(newMapping['1'].children).toContain('2');
        expect(newCurrentNode).toBe('2');
    });

    test('readMessage', () => {
        const message = ChatManager.readMessage('1', initialMapping);
        expect(message).toEqual(initialMessage);
    });

    test('updateMessage', () => {
        const updatedMessage: Message = {
            ...initialMessage,
            content: 'Updated content',
        };
        const newMapping = ChatManager.updateMessage(
            updatedMessage,
            initialMapping,
        );
        expect(newMapping['1'].message).toEqual(updatedMessage);
    });

    test('deleteMessage', () => {
        const { updatedMapping: newMapping } = ChatManager.deleteMessage(
            '1',
            initialMapping,
            '1',
        );
        expect(newMapping['1']).toBeUndefined();
    });

    test('upsertMessage', () => {
        const newMessage: Message = {
            id: '2',
            content: 'Hi',
            role: 'assistant',
        };
        let { mapping: newMapping } = ChatManager.upsertMessage(
            newMessage,
            initialMapping,
            '1',
        );
        expect(newMapping['2']).toEqual({
            id: '2',
            message: newMessage,
            parent: '1',
            children: [],
        });
        expect(newMapping['1'].children).toContain('2');

        const updatedMessage: Message = {
            ...newMessage,
            content: 'Updated content',
        };
        ({ mapping: newMapping } = ChatManager.upsertMessage(
            updatedMessage,
            newMapping,
            '1',
        ));
        expect(newMapping['2'].message).toEqual(updatedMessage);
    });

    test('getOrderedMessages', () => {
        const newMessage: Message = {
            id: '2',
            content: 'Hi',
            role: 'assistant',
        };
        let { mapping: newMapping } = ChatManager.createMessage(
            newMessage,
            initialMapping,
            '1',
        );
        const orderedMessages = ChatManager.getOrderedMessages('2', newMapping);
        expect(orderedMessages).toEqual([initialMessage, newMessage]);
    });

    test('prepareMessageHistory', () => {
        const newMessage: Message = {
            id: '2',
            content: 'Hi',
            role: 'assistant',
            name: 'Bot',
        };
        let { mapping: newMapping } = ChatManager.createMessage(
            newMessage,
            initialMapping,
            '1',
        );
        const history = ChatManager.prepareMessageHistory('2', newMapping);
        expect(history).toEqual([
            {
                ...initialMessage,
                name: undefined,
            },
            {
                ...newMessage,
                name: 'Bot',
            },
        ]);
    });

    test('editMessageAndFork', () => {
        const alternateMessage: Message = {
            id: '3',
            content: 'Alternate content',
            role: 'assistant',
        };
        let { mapping: newMapping } = ChatManager.editMessageAndFork(
            '1',
            alternateMessage,
            initialMapping,
        );
        expect(newMapping['1'].children).toContain('3');
        expect(newMapping['3']).toEqual({
            id: '3',
            message: alternateMessage,
            parent: '1',
            children: [],
        });
    });

    test('getSystemMessage', () => {
        const systemMessage: Message = {
            id: '0',
            content: 'System message',
            role: 'system',
        };
        let { currentNode: newCurrentNode, mapping: newMapping } =
            ChatManager.createMessage(systemMessage, initialMapping, null);
        const retrievedSystemMessage = ChatManager.getSystemMessage(
            newCurrentNode,
            newMapping,
        );
        expect(retrievedSystemMessage).toEqual(systemMessage);
    });

    test('regenerateAndFork', () => {
        const newMessage: Message = {
            id: '2',
            content: 'Hi',
            role: 'assistant',
        };
        let { mapping: newMapping, currentNode: newCurrentNode } =
            ChatManager.createMessage(newMessage, initialMapping, '1');
        const regeneratedState = ChatManager.regenerateAndFork(
            newCurrentNode,
            newMapping,
        );
        expect(regeneratedState.currentNode).not.toBe(newCurrentNode);
        expect(
            regeneratedState.mapping[regeneratedState.currentNode!].message,
        ).toEqual(newMessage);
    });
});
