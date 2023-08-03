'use client';

import initialState from '@/providers/initialChat';

export function getLocalCharacterList() {
    const characters = window.localStorage.getItem('chatCharacterList');
    const localCharacters: AgentConfig[] = characters
        ? JSON.parse(characters)
        : initialState.characterList;
    return localCharacters;
}

export function deleteAllLocalCharacterList() {
    window.localStorage.removeItem('chatCharacterList');
}

export function getLocalThreadList() {
    const threads = window.localStorage.getItem('chatThreads');
    const localThreads: ChatThread[] = threads
        ? JSON.parse(threads).map((t: ChatThread) => ({
              ...t,
              created: new Date(t.created),
              lastModified: new Date(t.lastModified),
          }))
        : initialState.threads;
    return localThreads;
}

export function setLocalThreadList(threads: ChatThread[]) {
    window.localStorage.setItem('chatThreads', JSON.stringify(threads));
}

export function deleteAllLocalThreadList() {
    window.localStorage.removeItem('chatThreads');
}

export function getLocalOpenAiKey() {
    return window.localStorage.getItem('openai-api-key');
}

export function setLocalOpenAiKey(key: string) {
    window.localStorage.setItem('openai-api-key', key);
}

export function deleteLocalOpenAiKey() {
    window.localStorage.removeItem('openai-api-key');
}
