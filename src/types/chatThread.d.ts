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

type MessageGroup = {
    role: Role;
    messages: Message[];
};

interface MessageRelationship {
    id: string;
    message: Message | null;
    /** Parent is null when it is the initial message */
    parent: string | null;
    children: string[];
}

type MessageMapping = {
    [key: string]: MessageRelationship;
};

interface ChatThread {
    id: string;
    created: Date;
    lastModified: Date;
    title: string;
    mapping: MessageMapping;
    currentNode: string | null;
    agentConfig: AgentConfig;
}

type NewMapping = {
    newMapping: MessageMapping;
    newCurrentNode: string | null;
};
