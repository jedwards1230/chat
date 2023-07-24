'use client';

import Title from './Title';

export function ChatPlaceholder() {
    return (
        <div className="relative flex h-full w-full select-none flex-col items-center justify-start gap-8 py-2">
            <Title />
        </div>
    );
}
