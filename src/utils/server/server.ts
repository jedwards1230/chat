'use server';

import { auth } from '@clerk/nextjs';

import { redis } from '@/lib/redis';
import supabase from '@/lib/supabase';
import { serializeSaveData } from '..';

export async function shareChatThread(thread: ChatThread) {
    const { userId } = auth();
    if (!userId) {
        return null;
    }

    const success = await redis.set(
        'share_' + thread.id,
        serializeSaveData({ thread }),
    );
    if (!success) {
        throw new Error('Error saving chat history');
    }

    const expire = await redis.expire('share_' + thread.id, 60 * 60 * 24 * 30);
    if (!expire) {
        throw new Error('Error setting expiration on share');
    }
}

export async function saveCharacterList(characters: AgentConfig[]) {
    const { userId } = auth();
    if (!userId) {
        throw new Error('No user id');
    }

    const { data, error } = await supabase.from('agent_config').upsert(
        characters.map((character) => ({
            ...character,
            user_id: userId,
            tools: JSON.stringify(character.tools),
        })),
        { onConflict: 'id' },
    );

    if (error) {
        throw new Error(error.message);
    }
}

export async function saveThread(thread: ChatThread) {
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

export async function deleteMessage(messageId: string) {
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

// delete thread by id
export async function deleteCloudThread(threadId: string) {
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

// delete all chat_threads for user
export async function deleteAllCloudThreads() {
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

export async function getChatThreadList(userId: string): Promise<ChatThread[]> {
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

    return threads
        .map((thread: any) => {
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
                agentConfig: JSON.parse(thread.agentConfig),
            };
        })
        .filter(Boolean);
}

export async function getAgentConfigs(userId: string): Promise<AgentConfig[]> {
    const { data: configs, error } = await supabase
        .from('agent_config')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        throw new Error(error.message);
    }

    return configs.map((config: any) => {
        return {
            ...config,
            tools: JSON.parse(config.tools),
        };
    });
}
