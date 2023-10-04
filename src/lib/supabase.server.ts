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
        const { data, error } = await supabase
            .from('AgentConfigs')
            .insert(agentConfigs);
        if (error) throw new Error(error.message);
        return data;
    },
    async createUser(userId: string) {
        const { data, error } = await supabase
            .from('Users')
            .insert([{ userId: userId }]);
        if (error) throw new Error(error.message);
        return data;
    },
    async getAgentConfigs(userId: string) {
        const { data: configs, error } = await supabase
            .from('AgentConfigs')
            .select('*')
            .eq('userId', userId);
        if (error) throw new Error(error.message);
        return configs;
    },
    async getChatThreads(userId: string) {
        const { data: threads, error } = await supabase
            .from('ChatThreads')
            .select('*')
            .eq('userId', userId);
        if (error) throw new Error(error.message);
        return threads;
    },
    async getChildMessages(messageId: string) {
        const { data: childMessages, error } = await supabase
            .from('ChildMessages')
            .select('*')
            .eq('messageId', messageId);
        if (error) throw new Error(error.message);
        return childMessages;
    },
    async getMessages(idList: string[]) {
        const { data: messages, error } = await supabase
            .from('Messages')
            .select('*')
            .in('id', idList);
        if (error) throw new Error(error.message);
        return messages;
    },
    async getSharedMessages(sharedThreadId: string) {
        const { data: messages, error } = await supabase
            .from('SharedMessages')
            .select('*')
            .eq('sharedThreadId', sharedThreadId);
        if (error) throw new Error(error.message);
        return messages;
    },
    async getSharedChatThread(id: string) {
        const { data: thread, error } = await supabase
            .from('SharedChatThreads')
            .select('*')
            .eq('id', id);
        if (error) throw new Error(error.message);
        return thread;
    },
    async getUser(userId: string) {
        const { data: user, error } = await supabase
            .from('Users')
            .select('*')
            .eq('userId', userId);
        if (error) throw new Error(error.message);
        return user;
    },
    async upsertAgentConfigs(agentConfigs: Tables<'AgentConfigs'>[]) {
        const { data, error } = await supabase
            .from('AgentConfigs')
            .upsert(agentConfigs, { onConflict: 'id' });
        if (error) throw new Error(error.message);
        return data;
    },
    async upsertChatThreads(chatThreads: Tables<'ChatThreads'>[]) {
        const { data, error } = await supabase
            .from('ChatThreads')
            .upsert(chatThreads, { onConflict: 'id' });
        if (error) throw new Error(error.message);
        return data;
    },
    async upsertChildMessages(childMessages: Tables<'ChildMessages'>[]) {
        const { data, error } = await supabase
            .from('ChildMessages')
            .upsert(childMessages, { onConflict: 'messageId' });
        if (error) throw new Error(error.message);
        return data;
    },
    async upsertMessages(messages: Tables<'Messages'>[]) {
        const { data, error } = await supabase
            .from('Messages')
            .upsert(messages, { onConflict: 'id' });
        if (error) throw new Error(error.message);
        return data;
    },
    async upsertSharedChatThreads(
        sharedChatThreads: Tables<'SharedChatThreads'>[],
    ) {
        const { data, error } = await supabase
            .from('SharedChatThreads')
            .upsert(sharedChatThreads, { onConflict: 'id' });
        if (error) throw new Error(error.message);
        return data;
    },
    async upsertSharedMessages(sharedMessages: Tables<'SharedMessages'>[]) {
        const { data, error } = await supabase
            .from('SharedMessages')
            .upsert(sharedMessages, { onConflict: 'id' });
        if (error) throw new Error(error.message);
        return data;
    },
    async deleteAllAgentConfigs(userId: string) {
        const { data, error } = await supabase
            .from('AgentConfigs')
            .delete()
            .eq('userId', userId);
        if (error) throw new Error(error.message);
        return data;
    },
    async deleteChatThreads(idList: string[]) {
        const { data, error } = await supabase
            .from('ChatThreads')
            .delete()
            .in('id', idList);
        if (error) throw new Error(error.message);
        return data;
    },
    async deleteAllChatThreads(userId: string) {
        const { data, error } = await supabase
            .from('ChatThreads')
            .delete()
            .eq('userId', userId);
        if (error) throw new Error(error.message);
        return data;
    },
    async deleteMessage(id: string) {
        const { data, error } = await supabase
            .from('Messages')
            .delete()
            .eq('id', id);
        if (error) throw new Error(error.message);
        return data;
    },
};
