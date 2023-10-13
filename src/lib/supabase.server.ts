import { createClient } from '@supabase/supabase-js';

const privateKey = process.env.SUPABASE_PRIVATE_KEY;
if (!privateKey) throw new Error(`Expected env var SUPABASE_PRIVATE_KEY`);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!url) throw new Error(`Expected env var NEXT_PUBLIC_SUPABASE_URL`);

const supabase = createClient<Database>(url, privateKey, {
    auth: {
        persistSession: false,
    },
});

export default supabase;

export const db = {
    async createAgentConfigs(agentConfigs: Tables<'AgentConfigs'>[]) {
        const { error } = await supabase
            .from('AgentConfigs')
            .insert(agentConfigs);
        if (error) throw new Error(error.message);
    },
    async createUser(userId: string) {
        const { error } = await supabase
            .from('Users')
            .insert([{ userId: userId }]);
        if (error) throw new Error(error.message);
    },
    async getAgentConfigs(userId: string): Promise<Tables<'AgentConfigs'>[]> {
        const { data: configs, error } = await supabase
            .from('AgentConfigs')
            .select('*')
            .eq('userId', userId);
        if (error) throw new Error(error.message);
        return configs;
    },
    async getChatThreads(userId: string): Promise<Tables<'ChatThreads'>[]> {
        const { data: threads, error } = await supabase
            .from('ChatThreads')
            .select('*')
            .eq('userId', userId);
        if (error) throw new Error(error.message);
        return threads;
    },
    async getMessageRelations(
        messageId: string,
    ): Promise<Tables<'MessageRelationships'>[]> {
        const { data: messageRelationships, error } = await supabase
            .from('MessageRelationships')
            .select('*')
            .eq('childMessageId', messageId);
        if (error) throw new Error(error.message);
        return messageRelationships;
    },
    async getMessageRelationsForMessages(
        messageIds: string[],
    ): Promise<Tables<'MessageRelationships'>[]> {
        const { data: messageRelationships, error } = await supabase
            .from('MessageRelationships')
            .select('*')
            .in('childMessageId', messageIds);
        if (error) throw new Error(error.message);
        return messageRelationships;
    },
    async getMessages(threadId: string): Promise<Tables<'Messages'>[]> {
        const { data: messages, error } = await supabase
            .from('Messages')
            .select('*')
            .eq('threadId', threadId);
        if (error) throw new Error(error.message);
        return messages;
    },
    async getMessagesForThreads(
        threadIds: string[],
    ): Promise<Tables<'Messages'>[]> {
        const { data: messages, error } = await supabase
            .from('Messages')
            .select('*')
            .in('threadId', threadIds);
        if (error) throw new Error(error.message);
        return messages;
    },
    async getSharedMessages(
        sharedThreadId: string,
    ): Promise<Tables<'SharedMessages'>[]> {
        const { data: messages, error } = await supabase
            .from('SharedMessages')
            .select('*')
            .eq('sharedThreadId', sharedThreadId);
        if (error) throw new Error(error.message);
        return messages;
    },
    async getSharedChatThread(
        id: string,
    ): Promise<Tables<'SharedChatThreads'>[]> {
        const { data: thread, error } = await supabase
            .from('SharedChatThreads')
            .select('*')
            .eq('id', id);
        if (error) throw new Error(error.message);
        return thread;
    },
    async getUser(userId: string): Promise<Tables<'Users'>[]> {
        const { data: user, error } = await supabase
            .from('Users')
            .select('*')
            .eq('userId', userId);
        if (error) throw new Error(error.message);
        return user;
    },
    async upsertAgentConfigs(agentConfigs: Tables<'AgentConfigs'>[]) {
        const { error } = await supabase
            .from('AgentConfigs')
            .upsert(agentConfigs, { onConflict: 'id' });
        if (error) throw new Error(error.message);
    },
    async upsertChatThreads(chatThreads: Tables<'ChatThreads'>[]) {
        const { error } = await supabase
            .from('ChatThreads')
            .upsert(chatThreads, { onConflict: 'id' });
        if (error) throw new Error(error.message);
    },
    async upsertMessageRelationships(
        messageRelationships: Tables<'MessageRelationships'>[],
    ) {
        for (let message of messageRelationships) {
            const { data: existingMessage, error: existingError } =
                await supabase
                    .from('MessageRelationships')
                    .select('*')
                    .eq('parentMessageId', message.parentMessageId)
                    .eq('childMessageId', message.childMessageId);

            if (existingError) throw new Error(existingError.message);

            if (existingMessage && existingMessage.length > 0) {
                // if message exists, update it
                const { error: updateError } = await supabase
                    .from('MessageRelationships')
                    .update(message)
                    .eq('parentMessageId', message.parentMessageId)
                    .eq('childMessageId', message.childMessageId);

                if (updateError) throw new Error(updateError.message);
            } else {
                // if message doesn't exist, insert it
                const { error: insertError } = await supabase
                    .from('MessageRelationships')
                    .insert([message]);

                if (insertError) throw new Error(insertError.message);
            }
        }
    },
    async upsertMessages(messages: Tables<'Messages'>[]) {
        const { error } = await supabase
            .from('Messages')
            .upsert(messages, { onConflict: 'id' });
        if (error) throw new Error(error.message);
    },
    async upsertSharedChatThreads(
        sharedChatThreads: Tables<'SharedChatThreads'>[],
    ) {
        const { error } = await supabase
            .from('SharedChatThreads')
            .upsert(sharedChatThreads, { onConflict: 'id' });
        if (error) throw new Error(error.message);
    },
    async upsertSharedMessages(sharedMessages: Tables<'SharedMessages'>[]) {
        const { error } = await supabase
            .from('SharedMessages')
            .upsert(sharedMessages, { onConflict: 'id' });
        if (error) throw new Error(error.message);
    },
    async deleteAllAgentConfigs(userId: string) {
        const { error } = await supabase
            .from('AgentConfigs')
            .delete()
            .eq('userId', userId);
        if (error) throw new Error(error.message);
    },
    async deleteChatThreads(idList: string[]) {
        const { error } = await supabase
            .from('ChatThreads')
            .delete()
            .in('id', idList);
        if (error) throw new Error(error.message);
    },
    async deleteAllChatThreads(userId: string) {
        const { error } = await supabase
            .from('ChatThreads')
            .delete()
            .eq('userId', userId);
        if (error) throw new Error(error.message);
    },
    async deleteMessage(id: string) {
        const { error } = await supabase.from('Messages').delete().eq('id', id);
        if (error) throw new Error(error.message);
    },
};
