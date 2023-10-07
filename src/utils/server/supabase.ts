'use server';

import { auth } from '@/auth';
import ChatManager from '@/lib/ChatManager';
import { db } from '@/lib/supabase.server';
import { defaultAgents } from '@/providers/characters';
import initialState from '@/providers/initialChat';

/* 
Threads
*/
export async function getThreadListByUserId(
    userId: string | undefined,
): Promise<ChatThread[]> {
    if (!userId) return [];

    // Fetch threads for the user
    const [agentConfigs, threads] = await Promise.all([
        db.getAgentConfigs(userId),
        db.getChatThreads(userId),
    ]);

    const threadList: ChatThread[] = [];
    for (const thread of threads) {
        if (!thread.agentConfigId)
            throw new Error(`Thread ${thread.id} has no agent config ID`);

        const messages = await db.getMessages(thread.id);

        let currentNode: string | null = null;
        const mapping: MessageMapping = {};
        for (const message of messages) {
            if (message.active) currentNode = message.id;

            const relations = await db.getMessageRelations(message.id);
            for (const { parentMessageId, childMessageId } of relations) {
                mapping[message.id] = {
                    id: message.id,
                    message: {
                        ...message,
                        name: message.name || 'Chat',
                        createdAt: message.createdAt
                            ? new Date(message.createdAt)
                            : new Date(),
                    },
                    parent: parentMessageId,
                    children: [childMessageId],
                };
            }
        }

        const base = agentConfigs[0];
        const agentConfig: AgentConfig = {
            id: base.id,
            name: base.name || 'Chat',
            tools: base.tools ? (base.tools as Tool[]) : [],
            toolsEnabled: base.toolsEnabled || false,
            model: JSON.parse(base.model as string),
            systemMessage: base.systemMessage || '',
        };

        threadList.push({
            id: thread.id,
            title: thread.title || 'Title',
            currentNode,
            created: new Date(thread.created),
            lastModified: new Date(thread.lastModified),
            mapping,
            agentConfig,
        });
    }

    return threadList.length > 0 ? threadList : initialState.threads;
}

export async function upsertThread(thread: ChatThread) {
    const messages = ChatManager.getOrderedMessages(
        thread.currentNode,
        thread.mapping,
    );
    if (messages.length === 0) return;

    const userId = await getUserId();
    if (!userId) return;

    await db.upsertAgentConfigs([
        {
            id: thread.agentConfig.id,
            userId,
            name: thread.agentConfig.name,
            tools: thread.agentConfig.tools,
            toolsEnabled: thread.agentConfig.toolsEnabled,
            model: JSON.stringify(thread.agentConfig.model),
            systemMessage: thread.agentConfig.systemMessage,
        },
    ]);

    await db.upsertChatThreads([
        {
            id: thread.id,
            userId,
            created: thread.created?.toJSON(),
            lastModified: thread.lastModified?.toJSON(),
            title: thread.title,
            agentConfigId: thread.agentConfig.id,
        },
    ]);

    // Upsert messages before upserting chat threads
    for (const message of messages) {
        await db.upsertMessages([
            {
                id: message.id,
                threadId: thread.id,
                content: message.content,
                active: message.id === thread.currentNode,
                role: message.role,
                createdAt: message.createdAt?.toJSON() || new Date().toJSON(),
                name: message.name || 'Chat',
                functionCallName: message.function_call?.name || null,
                functionCallArguments: message.function_call?.arguments || null,
            },
        ]);
    }

    // Then upsert the corresponding child message in the MessageRelationships table
    const messageRelations = Object.values(thread.mapping);
    const relations: Tables<'MessageRelationships'>[] = [];
    for (const relation of messageRelations) {
        if (relation.parent) {
            relations.push({
                childMessageId: relation.id,
                parentMessageId: relation.parent,
            });
        }
    }
    await db.upsertMessageRelationships(relations);
}

export async function deleteThreadById(threadId: string) {
    const userId = await getUserId();
    if (!userId) return;
    await db.deleteChatThreads([threadId]);
}

export async function deleteAllThreads() {
    const userId = await getUserId();
    if (!userId) return;
    await db.deleteAllChatThreads(userId);
}

/* 
Shared Threads
*/
export async function shareThread(thread: ChatThread) {
    const userId = await getUserId();
    if (!userId) return;
    const threadData = await db.upsertSharedChatThreads([
        {
            id: thread.id,
            userId,
            originalThreadId: thread.id,
            created: thread.created?.toJSON(),
            lastModified: thread.lastModified?.toJSON(),
            title: thread.title,
            agentConfig: JSON.stringify(thread.agentConfig),
        },
    ]);

    const messages = ChatManager.getOrderedMessages(
        thread.currentNode,
        thread.mapping,
    );
    const messageData = await db.upsertSharedMessages(
        messages.map((message) => ({
            id: message.id,
            sharedThreadId: thread.id,
            content: message.content || '',
            role: message.role,
            createdAt: message.createdAt?.toJSON() || new Date().toJSON(),
            name: message.name || '',
            functionCall: message.function_call || '',
        })),
    );

    return { thread: threadData, messages: messageData };
}

export async function getSharedThreadById(
    threadId: string,
): Promise<ChatThread> {
    const thread = await db.getSharedChatThread(threadId);
    const messages = await db.getSharedMessages(threadId);

    return {
        ...thread[0],
        created: new Date(thread[0].created),
        lastModified: new Date(thread[0].lastModified),
    } as unknown as ChatThread;
}

/* 
Characters
*/
export async function getCharacterListByUserId(
    userId: string | undefined,
): Promise<AgentConfig[]> {
    if (!userId) return defaultAgents;
    const configs = await db.getAgentConfigs(userId);

    if (configs.length > 0) {
        return configs.map((c) => ({
            ...c,
            name: c.name || 'Chat',
            tools: c.tools ? (c.tools as Tool[]) : [],
            toolsEnabled: c.toolsEnabled || false,
            model: JSON.parse(c.model as string),
            systemMessage: c.systemMessage || '',
        }));
    }

    const characterList = initialState.characterList;
    await db.createAgentConfigs(
        characterList.map((character) => ({
            ...character,
            userId,
            model: JSON.stringify(character.model),
        })),
    );

    return characterList;
}

export async function upsertCharacter(character: AgentConfig) {
    const userId = await getUserId();
    if (!userId) return;
    await db.upsertAgentConfigs([
        {
            ...character,
            userId,
            model: JSON.stringify(character.model),
        },
    ]);
}

export async function deleteAllCharacters() {
    const userId = await getUserId();
    if (!userId) return;
    await db.deleteAllAgentConfigs(userId);
}

/* 
Messages
*/
export async function deleteMessageById(messageId: string) {
    const userId = await getUserId();
    await db.deleteMessage(messageId);
}

export async function getUserId(init = false) {
    const session = await auth();
    const userId = session?.user?.email;

    if (!userId) return;

    if (init) {
        console.log('Initializing user', userId);
        const data = await db.getUser(userId);

        if (data?.length === 0) {
            console.log('Creating user', userId);
            await db.createUser(userId);
        }
    }

    return userId;
}
