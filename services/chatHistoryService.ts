// services/chatHistoryService.ts
import { supabase } from './supabaseService';
import { ChatHistory, ChatMessage } from '../types';

if (!supabase) {
    console.warn("Supabase client is not initialized. Chat history features will be disabled.");
}

export const getChatHistoryForUser = async (userId: string): Promise<ChatHistory[]> => {
    if (!supabase) return [];
    try {
        const { data, error } = await supabase
            .from('chat_histories')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching chat history:", error);
            throw error;
        }
        return data || [];
    } catch (error) {
        return [];
    }
};

export const saveNewChat = async (
    userId: string,
    userName: string,
    initialQuery: string,
    domain: string,
    messages: ChatMessage[]
): Promise<ChatHistory | null> => {
    if (!supabase) return null;
    try {
        const newChat: Omit<ChatHistory, 'id' | 'created_at'> = {
            user_id: userId,
            user_name: userName,
            initial_query: initialQuery,
            domain: domain,
            messages: messages,
        };

        const { data, error } = await supabase
            .from('chat_histories')
            .insert([newChat])
            .select()
            .single();

        if (error) {
            console.error("Error saving new chat:", error);
            throw error;
        }
        return data;
    } catch (error) {
        return null;
    }
};

export const updateChatHistory = async (chatId: string, messages: ChatMessage[]): Promise<ChatHistory | null> => {
    if (!supabase) return null;
    try {
        const { data, error } = await supabase
            .from('chat_histories')
            .update({ messages: messages })
            .eq('id', chatId)
            .select()
            .single();

        if (error) {
            console.error("Error updating chat history:", error);
            throw error;
        }
        return data;
    } catch (error) {
        return null;
    }
};
