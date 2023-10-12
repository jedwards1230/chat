type AppSettingsSection = 'General' | 'Credentials' | 'Data';

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

interface SearchResult {
    /** Query used with Search Engine API */
    query: string;
    url: string;
    snippet: string;
    title: string;
    /** AI-generated summary */
    content?: string;
    error?: string;
    /** Finished analysis for primary chat */
    reviewed?: boolean;
    /** Fime taken to store text embeddings  */
    timeToComplete?: number;
}

type User =
    | {
          name?: string | null;
          email?: string | null;
          image?: string | null;
      }
    | undefined;

type PlausibleHook = (
    eventName: string,
    {
        props: { threadId, usedCloudKey },
    }: {
        props: { threadId: string; usedCloudKey: boolean };
    },
) => any;

type NewMapping = {
    newMapping: MessageMapping;
    newCurrentNode: string | null;
};
