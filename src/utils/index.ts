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

export function mergeThreads(
    oldThreads: ChatThread[],
    newThreads: ChatThread[],
): ChatThread[] {
    const threadMap = new Map<string, ChatThread>();

    // Add the old threads to the map
    oldThreads.forEach((thread) => {
        threadMap.set(thread.id, thread);
    });

    // Add the new threads to the map, replacing the old ones if the new one is more recent
    newThreads.forEach((thread) => {
        const existingThread = threadMap.get(thread.id);
        if (
            !existingThread ||
            existingThread.lastModified < thread.lastModified
        ) {
            threadMap.set(thread.id, thread);
        }
    });

    // Convert the map values back to an array
    return Array.from(threadMap.values());
}

export function mergeCharacters(
    oldCharacters: any[],
    newCharacters: any[],
): any[] {
    const characterMap = new Map<string, any>();

    // Add the old characters to the map
    oldCharacters.forEach((character) => {
        characterMap.set(character.name, character);
    });

    // Add the new characters to the map, replacing the old ones if the new one is more recent
    newCharacters.forEach((character) => {
        const existingCharacter = characterMap.get(character.id);
        if (
            !existingCharacter ||
            existingCharacter.lastModified < character.lastModified
        ) {
            characterMap.set(character.name, character);
        }
    });

    // Convert the map values back to an array
    return Array.from(characterMap.values());
}
