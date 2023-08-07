'use server';

import { auth } from '@clerk/nextjs';

import supabase from '@/lib/supabase.server';
import initialState from '@/providers/initialChat';

/* 
Threads
*/
export async function getThreadListByUserId(
    userId: string,
): Promise<ChatThread[]> {
    const { data: threads, error } = await supabase
        .from('chat_threads')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        throw new Error(error.message);
    }

    const { data: allMessages, error: messageError } = await supabase
        .from('messages')
        .select('*')
        .in(
            'chat_thread_id',
            threads.map((thread: any) => thread.id),
        )
        .order('message_order', { ascending: true });

    if (messageError) {
        throw new Error(messageError.message);
    }

    const threadList = threads
        .map((thread: ChatThread) => {
            const messages = allMessages.filter(
                (message: any) => message.chat_thread_id === thread.id,
            );

            if (messages.length <= 1) {
                return null;
            }

            return {
                ...thread,
                created: new Date(thread.created),
                lastModified: new Date(thread.lastModified),
                messages,
                agentConfig: JSON.parse(thread.agentConfig as any),
            };
        })
        .filter(Boolean) as ChatThread[];

    return threadList.length > 0 ? threadList : initialState.threads;
}

export async function upsertThread(thread: ChatThread) {
    if (thread.messages.length === 0) return;

    const { userId } = auth();
    if (!userId) {
        throw new Error('No user id');
    }

    if (thread.messages.length > 0) {
        const { data: threadData, error: threadError } = await supabase
            .from('chat_threads')
            .upsert(
                [
                    {
                        id: thread.id,
                        user_id: userId,
                        created: thread.created,
                        lastModified: thread.lastModified,
                        title: thread.title,
                        agentConfig: JSON.stringify(thread.agentConfig),
                    },
                ],
                { onConflict: 'id' },
            );

        if (threadError) {
            throw new Error(threadError.message);
        }

        for (const message of thread.messages) {
            const { data: messageData, error: messageError } = await supabase
                .from('messages')
                .upsert(
                    [
                        {
                            id: message.id,
                            chat_thread_id: thread.id,
                            content: message.content,
                            role: message.role,
                            created_at: message.createdAt,
                            name: message.name,
                            function_call: message.function_call,
                        },
                    ],
                    { onConflict: 'id' },
                );

            if (messageError) {
                throw new Error(messageError.message);
            }
        }
    }
}

export async function deleteThreadById(threadId: string) {
    const { userId } = auth();
    if (!userId) {
        throw new Error('No user id');
    }

    const { data: threadData, error: threadError } = await supabase
        .from('chat_threads')
        .delete()
        .eq('id', threadId);

    if (threadError) {
        throw new Error(threadError.message);
    }
}

export async function deleteAllThreads() {
    const { userId } = auth();
    if (!userId) {
        throw new Error('No user id');
    }

    const { data: threadData, error: threadError } = await supabase
        .from('chat_threads')
        .delete()
        .eq('user_id', userId);

    if (threadError) {
        throw new Error(threadError.message);
    }
}

/* 
Shared Threads
*/
export async function shareThread(thread: ChatThread) {
    const { userId } = auth();
    if (!userId) {
        throw new Error('No user id');
    }

    const { data: threadData, error: threadError } = await supabase
        .from('shared_chat_threads')
        .upsert(
            [
                {
                    id: thread.id,
                    user_id: userId,
                    original_thread_id: thread.id,
                    created: thread.created,
                    lastModified: thread.lastModified,
                    title: thread.title,
                    agentConfig: thread.agentConfig,
                },
            ],
            { onConflict: 'id' },
        );

    if (threadError) {
        throw new Error(`Error sharing chat thread: ${threadError.message}`);
    }

    const { data: messageData, error: messageError } = await supabase
        .from('shared_messages')
        .upsert(
            thread.messages.map(
                (message) => ({
                    id: message.id,
                    shared_thread_id: thread.id,
                    content: message.content,
                    role: message.role,
                    created_at: message.createdAt,
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

/* 
Characters
*/

// get single thread by id plus all messages
export async function getSharedThreadById(
    threadId: string,
): Promise<ChatThread> {
    const { data: thread, error } = await supabase
        .from('shared_chat_threads')
        .select('*')
        .eq('id', threadId);

    if (error) {
        throw new Error(error.message);
    }

    const { data: messages, error: messageError } = await supabase
        .from('shared_messages')
        .select('*')
        .eq('shared_thread_id', threadId)
        .order('message_order', { ascending: true });

    if (messageError) {
        throw new Error(messageError.message);
    }

    return {
        ...thread[0],
        created: new Date(thread[0].created),
        lastModified: new Date(thread[0].lastModified),
        messages,
    };
}

export async function getCharacterListByUserId(
    userId: string,
): Promise<AgentConfig[]> {
    const { data: configs, error } = await supabase
        .from('agent_config')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        throw new Error(error.message);
    }

    const characterList: AgentConfig[] = configs.map((config: any) => {
        return {
            ...config,
            tools: JSON.parse(config.tools),
        };
    });

    return characterList.length > 0
        ? characterList
        : initialState.characterList;
}

export async function upsertCharacter(character: AgentConfig) {
    const { userId } = auth();
    if (!userId) {
        throw new Error('No user id');
    }

    const { data, error } = await supabase.from('agent_config').upsert(
        [
            {
                ...(character.id ? { id: character.id } : {}),
                ...character,
                user_id: userId,
                tools: JSON.stringify(character.tools),
            },
        ],
        { onConflict: 'id' },
    );

    if (error) {
        throw new Error(error.message);
    }
}

/* export async function upsertCharacterList(characters: AgentConfig[]) {
    const { userId } = auth();
    if (!userId) {
        throw new Error('No user id');
    }

    const { data, error } = await supabase.from('agent_config').upsert(
        characters.map((character) => ({
            ...(character.id ? { id: character.id } : {}),
            ...character,
            user_id: userId,
            tools: JSON.stringify(character.tools),
        })),
        { onConflict: 'id' },
    );

    if (error) {
        throw new Error(error.message);
    }
} */

export async function deleteAllCharacters() {
    const { userId } = auth();
    if (!userId) {
        throw new Error('No user id');
    }

    const { data: characterData, error: characterError } = await supabase
        .from('agent_config')
        .delete()
        .eq('user_id', userId);

    if (characterError) {
        throw new Error(characterError.message);
    }
}

/* 
Messages
*/
export async function deleteMessageById(messageId: string) {
    const { userId } = auth();
    if (!userId) {
        throw new Error('No user id');
    }

    const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

    if (messageError) {
        throw new Error(messageError.message);
    }
}
