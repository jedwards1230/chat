'use server';

import { auth } from '@/auth';
import ChatManager from '@/lib/ChatManager';
import supabase from '@/lib/supabase.server';
import initialState from '@/providers/initialChat';

/* 
Threads
*/
export async function getThreadListByUserId(
    userId: string,
): Promise<ChatThread[]> {
    // Fetch threads for the user
    const { data: threads, error } = await supabase
        .from('ChatThreads')
        .select('*')
        .eq('userId', userId);

    if (error) throw new Error(error.message);

    const threadList: ChatThread[] = [];

    for (const thread of threads) {
        if (thread.currentNode === null) {
            console.error(`Thread ${thread.id} has no current node`);
            continue;
        }
        const { data: childMessages, error: childMessagesError } =
            await supabase
                .from('ChildMessages')
                .select('*')
                .eq('messageId', thread.currentNode);

        if (childMessagesError) throw new Error(childMessagesError.message);

        const idList = childMessages.map((cm: any) => cm.messageId);

        const { data: messages, error: messageError } = await supabase
            .from('Messages')
            .select('*')
            .in('id', idList);

        if (messageError) throw new Error(messageError.message);

        if (!thread.agentConfigId) {
            console.error(`Thread ${thread.id} has no agent config ID`);
            continue;
        }

        // ensure it matchs the userId too
        const { data: agentConfigs, error: agentConfigError } = await supabase
            .from('AgentConfigs')
            .select('*')
            .eq('id', thread.agentConfigId)
            .eq('userId', userId);

        if (agentConfigError) throw new Error(agentConfigError.message);

        const mapping: MessageMapping = {};
        childMessages.forEach((cm: any) => {
            mapping[cm.messageId] = cm;
        });

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
            currentNode: thread.currentNode,
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

    const session = await auth();
    const userId = session?.user?.email;

    if (messages.length > 0) {
        for (const message of messages) {
            // First upsert the message in the Messages table
            const { error: messageError } = await supabase
                .from('Messages')
                .upsert(
                    [
                        {
                            id: message.id,
                            content: message.content,
                            role: message.role,
                            createdAt: message.createdAt?.toJSON(),
                            name: message.name,
                            ...(message.function_call && message.function_call),
                        },
                    ],
                    { onConflict: 'id' },
                );

            if (messageError) {
                throw new Error(messageError.message);
            }

            // Then upsert the corresponding child message in the ChildMessages table
            const newChildMessage = {
                messageId: message.id,
                parent: thread.mapping[message.id]?.parent,
            };
            const { error: childMessageError } = await supabase
                .from('ChildMessages')
                .upsert([newChildMessage], { onConflict: 'messageId' });

            if (childMessageError) {
                throw new Error(childMessageError.message);
            }
        }

        // Now, upsert the thread in the ChatThreads table
        const { error: threadError } = await supabase
            .from('ChatThreads')
            .upsert(
                [
                    {
                        id: thread.id,
                        userId,
                        created: thread.created?.toJSON(),
                        lastModified: thread.lastModified?.toJSON(),
                        title: thread.title,
                        agentConfigId: thread.agentConfig.id,
                        currentNode: thread.currentNode,
                    },
                ],
                { onConflict: 'id' },
            );

        if (threadError) {
            throw new Error(threadError.message);
        }
    }
}

export async function deleteThreadById(threadId: string) {
    const session = await auth();
    const userId = session?.user?.email;

    if (userId) {
        const { data: threadData, error: threadError } = await supabase
            .from('ChatThreads')
            .delete()
            .eq('id', threadId);

        if (threadError) {
            throw new Error(threadError.message);
        }
    }
}

export async function deleteAllThreads() {
    const session = await auth();
    const userId = session?.user?.email;

    if (!userId) throw new Error('No user ID');

    const { data: threadData, error: threadError } = await supabase
        .from('ChatThreads')
        .delete()
        .eq('userId', userId);

    if (threadError) throw new Error(threadError.message);
}

/* 
Shared Threads
*/
export async function shareThread(thread: ChatThread) {
    const session = await auth();
    const userId = session?.user?.email;

    const { data: threadData, error: threadError } = await supabase
        .from('SharedChatThreads')
        .upsert(
            [
                {
                    id: thread.id,
                    originalThreadId: thread.id,
                    created: thread.created?.toJSON(),
                    lastModified: thread.lastModified?.toJSON(),
                    title: thread.title,
                    agentConfig: JSON.stringify(thread.agentConfig),
                },
            ],
            { onConflict: 'id' },
        );

    if (threadError) {
        throw new Error(`Error sharing chat thread: ${threadError.message}`);
    }

    const messages = ChatManager.getOrderedMessages(
        thread.currentNode,
        thread.mapping,
    );
    const { data: messageData, error: messageError } = await supabase
        .from('SharedMessages')
        .upsert(
            messages.map(
                (message) => ({
                    id: message.id,
                    sharedThreadId: thread.id,
                    content: message.content || '',
                    role: message.role,
                    created_at: message.createdAt?.toJSON(),
                    name: message.name,
                    function_call: message.function_call,
                }),
                { onConflict: 'id' },
            ),
        );

    if (messageError) {
        throw new Error(`Error sharing chat messages: ${messageError.message}`);
    }

    return { thread: threadData, messages: messageData };
}

// get single thread by id plus all messages
export async function getSharedThreadById(
    threadId: string,
): Promise<ChatThread> {
    const { data: thread, error } = await supabase
        .from('SharedChatThreads')
        .select('*')
        .eq('id', threadId);

    if (error) throw new Error(error.message);

    const { data: messages, error: messageError } = await supabase
        .from('SharedMessages')
        .select('*')
        .eq('shared_thread_id', threadId)
        .order('message_order', { ascending: true });

    if (messageError) throw new Error(messageError.message);

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
    userId: string,
): Promise<AgentConfig[]> {
    const { data: configs, error } = await supabase
        .from('AgentConfigs')
        .select('*')
        .eq('userId', userId);

    if (error) throw new Error(error.message);

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

    const { data: defaultCharacterData, error: defaultCharacterError } =
        await supabase.from('AgentConfigs').insert(
            characterList.map((character) => ({
                ...character,
                userId,
                model: JSON.stringify(character.model),
            })),
        );

    return characterList;
}

export async function upsertCharacter(character: AgentConfig) {
    const session = await auth();
    const userId = session?.user?.email;

    const { data, error } = await supabase
        .from('AgentConfigs')
        .upsert(
            [{ ...character, userId, model: JSON.stringify(character.model) }],
            { onConflict: 'id' },
        );

    if (error) {
        throw new Error(error.message);
    }
}

export async function deleteAllCharacters() {
    const session = await auth();
    const userId = session?.user?.email;

    if (!userId) throw new Error('No user ID');

    const { data: characterData, error: characterError } = await supabase
        .from('AgentConfigs')
        .delete()
        .eq('userId', userId);

    if (characterError) {
        throw new Error(characterError.message);
    }
}

/* 
Messages
*/
export async function deleteMessageById(messageId: string) {
    const session = await auth();
    const userId = session?.user?.email;

    const { data: messageData, error: messageError } = await supabase
        .from('Messages')
        .delete()
        .eq('id', messageId);

    if (messageError) {
        throw new Error(messageError.message);
    }
}

export async function getUserId(init = false) {
    const session = await auth();
    const userId = session?.user?.email;

    if (!userId) throw new Error('No user ID');

    if (init) {
        const { data, error } = await supabase
            .from('Users')
            .select('userId')
            .eq('userId', userId);

        if (data?.length === 0) {
            const { data, error } = await supabase
                .from('Users')
                .insert([{ userId: userId }]);
        }
    }

    return userId;
}
