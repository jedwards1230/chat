'use client';

import clsx from 'clsx';

export default function Sidebar({
    close,
    children,
    className,
    open,
    pos,
}: {
    close: () => void;
    children: React.ReactNode;
    className?: string;
    open: boolean;
    pos: 'left' | 'right';
}) {
    return (
        <>
            {/* Desktop */}
            <div
                className={clsx(
                    'fixed hidden h-full w-72 bg-accent py-2 text-accent-foreground transition-all dark:border-border md:flex lg:inset-y-0',
                    pos === 'left' ? 'left-0 border-r' : 'right-0 border-l',
                    open
                        ? 'translate-x-0'
                        : pos === 'left'
                        ? '-translate-x-full'
                        : 'translate-x-full',
                    className,
                )}
            >
                <div className="relative flex flex-col items-center justify-start w-full h-full gap-4 pb-2 md:pb-0">
                    {children}
                </div>
            </div>
            {/* Mobile */}
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    close();
                }}
                className={clsx(
                    'fixed z-10 h-screen w-screen transition-all md:hidden',
                    open
                        ? 'translate-x-0'
                        : pos === 'left'
                        ? '-translate-x-full'
                        : 'translate-x-full',
                )}
            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    className={clsx(
                        'absolute flex h-screen w-full max-w-[80%] flex-col bg-accent p-2 text-accent-foreground',
                        pos === 'left' ? 'left-0 border-r' : 'right-0 border-l',
                        className,
                    )}
                >
                    {children}
                </div>
            </div>
        </>
    );
}
