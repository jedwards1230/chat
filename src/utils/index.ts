import type { ChatCompletionRequestMessage } from 'openai-edge';

export function serializeSaveData(saveData: SaveData | ShareData): string {
    if ('thread' in saveData) {
        return JSON.stringify({
            ...saveData.thread,
            messages: JSON.stringify(saveData.thread.messages),
        });
    }
    return JSON.stringify({
        config: saveData.config,
        chatHistory: saveData.chatHistory.map((thread) => ({
            ...thread,
            messages: JSON.stringify(thread.messages),
        })),
    });
}

export function calculateRows(text: string, maxRows: number = 15) {
    let newlines = (text.match(/\n/g) || []).length;
    return newlines > 0 ? Math.min(newlines + 1, maxRows) : 1;
}

export function sortThreadlist(a: ChatThread, b: ChatThread) {
    return b.lastModified.getTime() - a.lastModified.getTime();
}

export function prepareMessages(
    messages: Message[],
): ChatCompletionRequestMessage[] {
    return messages.map((msg) => {
        if (msg.role === 'system') {
            return {
                role: msg.role,
                content: msg.content,
            };
        }
        return {
            role: msg.role,
            content: msg.content,
            ...(msg.name && { name: msg.name }),
            ...(msg.function_call && { function_call: msg.function_call }),
        };
    });
}
