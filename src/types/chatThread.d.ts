type Role = 'system' | 'user' | 'assistant' | 'function';

interface Message {
    id: string;
    content: string | null;
    role: Role;
    name?: string;
    createdAt?: Date;
    function_call?: {
        name: string;
        arguments: string | { input: string };
    };
}

/**
 * Message Groups are used purely for front end rendering purposes.
 * This breaks down messages into user and assistant groups.
 * The grouping allows for text content to be mixed with function calls and file uploads.
 * */
type MessageGroup = {
    role: Role;
    messages: Message[];
};

/**
 * Storing messages in a mapping allows for quick access to a message and its children.
 * This makes it easy to branch conversations and keep track of the current node.
 */
interface MessageRelationship {
    id: string;
    message: Message | null;
    /** Parent is null when it is the initial message */
    parent: string | null;
    children: string[];
}

/**
 * Map all messages in a `ChatThread`.
 */
type MessageMapping = {
    [key: string]: MessageRelationship;
};

/**
 * The entire conversation.
 * Tracks all branches of conversation and the active AI model.
 */
interface ChatThread {
    id: string;
    created: Date;
    lastModified: Date;
    title: string;
    mapping: MessageMapping;
    currentNode: string | null;
    agentConfig: AgentConfig;
}

/**
 * Small object to easily pass around message data
 */
type MessagesState = {
    mapping: MessageMapping;
    currentNode: string | null;
};
