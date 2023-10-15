'use client';

import initialState from '@/providers/initialChat';

export function getLocalCharacterList(): AgentConfig[] {
    const characters = window.localStorage.getItem('chatCharacterList');
    return characters ? JSON.parse(characters) : [];
}

export function deleteAllLocalCharacterList() {
    window.localStorage.removeItem('chatCharacterList');
}

export function getLocalThreadList() {
    const threads = window.localStorage.getItem('chatThreads');

    const parseThread = (t: ChatThread): ChatThread => {
        return {
            ...t,
            created: new Date(t.created),
            lastModified: new Date(t.lastModified),
            mapping: Object.fromEntries(
                Object.entries(t.mapping).map(([key, value]) => [
                    key,
                    {
                        ...value,
                        children: [...new Set(value.children)],
                        message: value.message
                            ? {
                                  ...value.message,
                                  createdAt: value.message.createdAt
                                      ? new Date(value.message.createdAt)
                                      : new Date(),
                              }
                            : null,
                    },
                ]),
            ),
        };
    };

    const localThreads: ChatThread[] = threads
        ? JSON.parse(threads).map(parseThread)
        : initialState.threads;
    return localThreads;
}

export function deleteLocalThreadById(id: string) {
    const threads = window.localStorage.getItem('chatThreads');
    const localThreads: ChatThread[] = threads
        ? JSON.parse(threads).filter((t: ChatThread) => t.id !== id)
        : initialState.threads;
    window.localStorage.setItem('chatThreads', JSON.stringify(localThreads));
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
