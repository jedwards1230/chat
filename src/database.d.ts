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
                    model: Json | null;
                    name: string | null;
                    systemMessage: string | null;
                    tools: string[] | null;
                    toolsEnabled: boolean | null;
                    userId: string | null;
                };
                Insert: {
                    id: string;
                    model?: Json | null;
                    name?: string | null;
                    systemMessage?: string | null;
                    tools?: string[] | null;
                    toolsEnabled?: boolean | null;
                    userId?: string | null;
                };
                Update: {
                    id?: string;
                    model?: Json | null;
                    name?: string | null;
                    systemMessage?: string | null;
                    tools?: string[] | null;
                    toolsEnabled?: boolean | null;
                    userId?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'AgentConfigs_userId_fkey';
                        columns: ['userId'];
                        referencedRelation: 'Users';
                        referencedColumns: ['userId'];
                    },
                ];
            };
            ChatThreads: {
                Row: {
                    agentConfigId: string | null;
                    created: string;
                    currentNode: string | null;
                    id: string;
                    lastModified: string;
                    title: string | null;
                    userId: string | null;
                };
                Insert: {
                    agentConfigId?: string | null;
                    created: string;
                    currentNode?: string | null;
                    id: string;
                    lastModified: string;
                    title?: string | null;
                    userId?: string | null;
                };
                Update: {
                    agentConfigId?: string | null;
                    created?: string;
                    currentNode?: string | null;
                    id?: string;
                    lastModified?: string;
                    title?: string | null;
                    userId?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'ChatThreads_agentConfigId_fkey';
                        columns: ['agentConfigId'];
                        referencedRelation: 'AgentConfigs';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'ChatThreads_userId_fkey';
                        columns: ['userId'];
                        referencedRelation: 'Users';
                        referencedColumns: ['userId'];
                    },
                ];
            };
            ChildMessages: {
                Row: {
                    messageId: string;
                    parent: string | null;
                };
                Insert: {
                    messageId: string;
                    parent?: string | null;
                };
                Update: {
                    messageId?: string;
                    parent?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'ChildMessages_messageId_fkey';
                        columns: ['messageId'];
                        referencedRelation: 'Messages';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'ChildMessages_parent_fkey';
                        columns: ['parent'];
                        referencedRelation: 'ChildMessages';
                        referencedColumns: ['messageId'];
                    },
                ];
            };
            Messages: {
                Row: {
                    content: string | null;
                    createdAt: string | null;
                    functionCallArguments: Json | null;
                    functionCallName: string | null;
                    id: string;
                    name: string | null;
                    role: Database['public']['Enums']['Role'];
                };
                Insert: {
                    content?: string | null;
                    createdAt?: string | null;
                    functionCallArguments?: Json | null;
                    functionCallName?: string | null;
                    id: string;
                    name?: string | null;
                    role: Database['public']['Enums']['Role'];
                };
                Update: {
                    content?: string | null;
                    createdAt?: string | null;
                    functionCallArguments?: Json | null;
                    functionCallName?: string | null;
                    id?: string;
                    name?: string | null;
                    role?: Database['public']['Enums']['Role'];
                };
                Relationships: [];
            };
            SharedChatThreads: {
                Row: {
                    agentConfig: Json;
                    created: string;
                    id: string;
                    lastModified: string;
                    originalThreadId: string;
                    title: string;
                    userId: string | null;
                };
                Insert: {
                    agentConfig: Json;
                    created: string;
                    id: string;
                    lastModified: string;
                    originalThreadId: string;
                    title: string;
                    userId?: string | null;
                };
                Update: {
                    agentConfig?: Json;
                    created?: string;
                    id?: string;
                    lastModified?: string;
                    originalThreadId?: string;
                    title?: string;
                    userId?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'SharedChatThreads_originalThreadId_fkey';
                        columns: ['originalThreadId'];
                        referencedRelation: 'ChatThreads';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'SharedChatThreads_userId_fkey';
                        columns: ['userId'];
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
                    messageOrder: number;
                    name: string | null;
                    role: string;
                    sharedThreadId: string;
                };
                Insert: {
                    content: string;
                    createdAt?: string | null;
                    functionCall?: Json | null;
                    id: string;
                    messageOrder?: number;
                    name?: string | null;
                    role: string;
                    sharedThreadId: string;
                };
                Update: {
                    content?: string;
                    createdAt?: string | null;
                    functionCall?: Json | null;
                    id?: string;
                    messageOrder?: number;
                    name?: string | null;
                    role?: string;
                    sharedThreadId?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'SharedMessages_sharedThreadId_fkey';
                        columns: ['sharedThreadId'];
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
            [_ in never]: never;
        };
        Enums: {
            Role: 'system' | 'user' | 'assistant' | 'function';
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
}
