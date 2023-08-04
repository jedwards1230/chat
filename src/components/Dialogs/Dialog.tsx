'use client';

import { useEffect, useRef } from 'react';
import clsx from 'clsx';

export default function Dialog({
    children,
    className,
    hideCard,
    size = 'md',
    callback,
}: {
    children: React.ReactNode;
    className?: string;
    hideCard?: boolean;
    size?: 'sm' | 'md' | 'lg';
    callback?: () => void;
}) {
    const ref = useRef<HTMLDivElement>(null);

    // click outside to close
    useEffect(() => {
        function handleClickOutside(event: any) {
            if (
                callback &&
                ref.current &&
                !ref.current.contains(event.target)
            ) {
                callback();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [callback]);

    return (
        <dialog className="fixed right-0 top-0 z-50 flex h-full w-full items-center justify-center bg-neutral-900/70">
            <div
                ref={ref}
                className={clsx(
                    'relative',
                    size === 'sm' && 'max-w-lg',
                    size === 'md' && 'max-w-xl',
                    size === 'lg' && 'max-w-2xl',
                    !hideCard &&
                        'rounded-lg border bg-neutral-50 p-4 transition-all dark:border-neutral-500 dark:bg-neutral-800 sm:px-6',
                    className,
                )}
            >
                {children}
            </div>
        </dialog>
    );
}
