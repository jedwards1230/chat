type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

interface Database {
    public: {
        Tables: {
            AgentConfigs: {
                Row: {
                    id: string;
                    model: Json;
                    name: string;
                    systemMessage: string;
                    tools: string[];
                    toolsEnabled: boolean;
                    userId: string;
                };
                Insert: {
                    id: string;
                    model: Json;
                    name: string;
                    systemMessage: string;
                    tools: string[];
                    toolsEnabled: boolean;
                    userId: string;
                };
                Update: {
                    id?: string;
                    model?: Json;
                    name?: string;
                    systemMessage?: string;
                    tools?: string[];
                    toolsEnabled?: boolean;
                    userId?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'AgentConfigs_userId_fkey';
                        columns: ['userId'];
                        isOneToOne: false;
                        referencedRelation: 'Users';
                        referencedColumns: ['userId'];
                    },
                ];
            };
            ChatThreads: {
                Row: {
                    agentConfigId: string;
                    created: string;
                    id: string;
                    lastModified: string;
                    title: string;
                    userId: string;
                };
                Insert: {
                    agentConfigId: string;
                    created: string;
                    id: string;
                    lastModified: string;
                    title: string;
                    userId: string;
                };
                Update: {
                    agentConfigId?: string;
                    created?: string;
                    id?: string;
                    lastModified?: string;
                    title?: string;
                    userId?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'ChatThreads_agentConfigId_fkey';
                        columns: ['agentConfigId'];
                        isOneToOne: false;
                        referencedRelation: 'AgentConfigs';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'ChatThreads_userId_fkey';
                        columns: ['userId'];
                        isOneToOne: false;
                        referencedRelation: 'Users';
                        referencedColumns: ['userId'];
                    },
                ];
            };
            documents: {
                Row: {
                    content: string | null;
                    embedding: string | null;
                    id: number;
                    metadata: Json | null;
                };
                Insert: {
                    content?: string | null;
                    embedding?: string | null;
                    id?: number;
                    metadata?: Json | null;
                };
                Update: {
                    content?: string | null;
                    embedding?: string | null;
                    id?: number;
                    metadata?: Json | null;
                };
                Relationships: [];
            };
            MessageRelationships: {
                Row: {
                    childMessageId: string;
                    parentMessageId: string;
                };
                Insert: {
                    childMessageId: string;
                    parentMessageId: string;
                };
                Update: {
                    childMessageId?: string;
                    parentMessageId?: string;
                };
                Relationships: [];
            };
            Messages: {
                Row: {
                    active: boolean | null;
                    content: string | null;
                    createdAt: string | null;
                    fileName: string | null;
                    functionCallArguments: Json | null;
                    functionCallName: string | null;
                    id: string;
                    name: string | null;
                    role: Database['public']['Enums']['Role'];
                    threadId: string;
                };
                Insert: {
                    active?: boolean | null;
                    content?: string | null;
                    createdAt?: string | null;
                    fileName?: string | null;
                    functionCallArguments?: Json | null;
                    functionCallName?: string | null;
                    id: string;
                    name?: string | null;
                    role: Database['public']['Enums']['Role'];
                    threadId: string;
                };
                Update: {
                    active?: boolean | null;
                    content?: string | null;
                    createdAt?: string | null;
                    fileName?: string | null;
                    functionCallArguments?: Json | null;
                    functionCallName?: string | null;
                    id?: string;
                    name?: string | null;
                    role?: Database['public']['Enums']['Role'];
                    threadId?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'Messages_threadId_fkey';
                        columns: ['threadId'];
                        isOneToOne: false;
                        referencedRelation: 'ChatThreads';
                        referencedColumns: ['id'];
                    },
                ];
            };
            SharedChatThreads: {
                Row: {
                    agentConfig: Json;
                    created: string;
                    id: string;
                    lastModified: string;
                    originalThreadId: string;
                    title: string;
                    userId: string;
                };
                Insert: {
                    agentConfig: Json;
                    created: string;
                    id: string;
                    lastModified: string;
                    originalThreadId: string;
                    title: string;
                    userId: string;
                };
                Update: {
                    agentConfig?: Json;
                    created?: string;
                    id?: string;
                    lastModified?: string;
                    originalThreadId?: string;
                    title?: string;
                    userId?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'SharedChatThreads_userId_fkey';
                        columns: ['userId'];
                        isOneToOne: false;
                        referencedRelation: 'Users';
                        referencedColumns: ['userId'];
                    },
                ];
            };
            SharedMessages: {
                Row: {
                    content: string;
                    createdAt: string | null;
                    functionCall: Json | null;
                    id: string;
                    name: string | null;
                    role: string;
                    sharedThreadId: string;
                };
                Insert: {
                    content: string;
                    createdAt?: string | null;
                    functionCall?: Json | null;
                    id: string;
                    name?: string | null;
                    role: string;
                    sharedThreadId: string;
                };
                Update: {
                    content?: string;
                    createdAt?: string | null;
                    functionCall?: Json | null;
                    id?: string;
                    name?: string | null;
                    role?: string;
                    sharedThreadId?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'SharedMessages_sharedThreadId_fkey';
                        columns: ['sharedThreadId'];
                        isOneToOne: false;
                        referencedRelation: 'SharedChatThreads';
                        referencedColumns: ['id'];
                    },
                ];
            };
            Users: {
                Row: {
                    userId: string;
                };
                Insert: {
                    userId: string;
                };
                Update: {
                    userId?: string;
                };
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            ivfflathandler: {
                Args: {
                    '': unknown;
                };
                Returns: unknown;
            };
            match_documents: {
                Args: {
                    query_embedding: string;
                    match_count?: number;
                    filter?: Json;
                };
                Returns: {
                    id: number;
                    content: string;
                    metadata: Json;
                    similarity: number;
                }[];
            };
            vector_avg: {
                Args: {
                    '': number[];
                };
                Returns: string;
            };
            vector_dims: {
                Args: {
                    '': string;
                };
                Returns: number;
            };
            vector_norm: {
                Args: {
                    '': string;
                };
                Returns: number;
            };
            vector_out: {
                Args: {
                    '': string;
                };
                Returns: unknown;
            };
            vector_send: {
                Args: {
                    '': string;
                };
                Returns: string;
            };
            vector_typmod_in: {
                Args: {
                    '': unknown[];
                };
                Returns: number;
            };
        };
        Enums: {
            Role: 'system' | 'user' | 'assistant' | 'function';
            Tool: 'calculator' | 'search' | 'web-browser' | 'wikipedia-api';
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
}
