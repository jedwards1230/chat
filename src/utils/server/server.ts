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

// Function to save a single message
export async function saveMessage(message: Message, threadId: string) {
    try {
        const { userId } = auth();
        if (!userId) {
            throw new Error('No user id');
        }

        const { data, error } = await supabase.from('messages').upsert(
            [
                {
                    id: message.id,
                    chat_thread_id: threadId,
                    content: message.content,
                    role: message.role,
                    created_at: message.createdAt,
                    name: message.name,
                    function_call: message.function_call,
                },
            ],
            { onConflict: 'id' },
        );

        if (error) {
            throw new Error(error.message);
        }
    } catch (error) {
        console.log(error);
    }
}

// Function to save the title
export async function saveTitle(threadId: string, title: string) {
    try {
        const { userId } = auth();
        if (!userId) {
            throw new Error('No user id');
        }

        const { data, error } = await supabase
            .from('chat_threads')
            .update({ title })
            .eq('id', threadId);

        if (error) {
            throw new Error(error.message);
        }
    } catch (error) {
        console.log(error);
    }
}

// Function to save the config
export async function saveConfig(config: Config) {
    try {
        const { userId } = auth();
        if (!userId) {
            throw new Error('No user id');
        }

        const { data, error } = await supabase
            .from('configs')
            .upsert([{ ...config, user_id: userId }], {
                onConflict: 'user_id',
            });

        if (error) {
            throw new Error(error.message);
        }
    } catch (error) {
        console.log(error);
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

export async function getCloudConfig(userId: string): Promise<Config | null> {
    const { data: config, error } = await supabase
        .from('configs')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return config;
}

export async function getChatThread(
    userId: string,
    threadId: string,
): Promise<ChatThread> {
    const { data: thread, error } = await supabase
        .from('chat_threads')
        .select('*')
        .eq('user_id', userId)
        .eq('id', threadId)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    const { data: messages, error: messageError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_thread_id', thread.id)
        .order('message_order', { ascending: true });

    if (messageError) {
        throw new Error(messageError.message);
    }

    return {
        ...thread,
        created: new Date(thread.created),
        lastModified: new Date(thread.lastModified),
        messages,
        agentConfig: JSON.parse(thread.agentConfig),
    };
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

export async function getCloudData(): Promise<{
    config: Config | null;
    threads: ChatThread[];
}> {
    const { userId } = auth();
    if (!userId) {
        return { config: null, threads: [] };
    }

    const [config, threads] = await Promise.allSettled([
        getCloudConfig(userId),
        getChatThreadList(userId),
    ]);

    return {
        config: config.status === 'fulfilled' ? config.value : null,
        threads: threads.status === 'fulfilled' ? threads.value : [],
    };
}
