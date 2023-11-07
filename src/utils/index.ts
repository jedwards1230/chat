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

/**
 * Groups the elements of an array based on the specified key.
 * The function returns an object where each property is an array of elements
 * that share the same value for the given key.
 *
 * @param array - The array to group.
 * @param key - The key to group by, which must be a property of the elements in the array.
 * @returns An object with properties corresponding to different values of the key.
 * Each property is an array containing the elements that have that key's value.
 *
 * @example
 * // Suppose we have an array of objects with a 'group' property
 * const items = [{ group: 'a', value: 1 }, { group: 'b', value: 2 }, { group: 'a', value: 3 }];
 * // Group items by the 'group' property
 * const grouped = groupBy(items, 'group');
 * // The 'grouped' object will be:
 * // {
 * //   a: [{ group: 'a', value: 1 }, { group: 'a', value: 3 }],
 * //   b: [{ group: 'b', value: 2 }]
 * // }
 */
export function groupBy<T, K extends keyof T>(
    array: T[],
    key: K,
): Record<string, T[]> {
    return array.reduce((result: any, currentValue: T) => {
        (result[currentValue[key]] = result[currentValue[key]] || []).push(
            currentValue,
        );
        return result;
    }, {});
}
