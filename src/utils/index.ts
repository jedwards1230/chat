import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function calculateRows(text: string, maxRows: number = 15) {
    let newlines = (text.match(/\n/g) || []).length;
    return newlines > 0 ? Math.min(newlines + 1, maxRows) : 1;
}

export function sortThreadlist(a: ChatThread, b: ChatThread) {
    return b.lastModified.getTime() - a.lastModified.getTime();
}

export function mergeThreads(
    oldThreads: ChatThread[],
    newThreads: ChatThread[],
): ChatThread[] {
    const threadMap = new Map<string, ChatThread>();

    // Add the old threads to the map
    oldThreads.forEach((thread) => threadMap.set(thread.id, thread));

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
    oldCharacters: AgentConfig[],
    newCharacters: AgentConfig[],
): AgentConfig[] {
    const characterMap = new Map<string, any>();

    // Add the old characters to the map
    oldCharacters.forEach((character) =>
        characterMap.set(character.name, character),
    );

    // Add the new characters to the map, replacing the old ones if the new one is more recent
    newCharacters.forEach((character) =>
        characterMap.set(character.name, character),
    );

    // Convert the map values back to an array
    return Array.from(characterMap.values());
}
