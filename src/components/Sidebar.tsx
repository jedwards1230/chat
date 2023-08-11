'use client';

import clsx from 'clsx';

export default function Sidebar({
    close,
    children,
    className,
    translate,
}: {
    close: () => void;
    children: React.ReactNode;
    className?: string;
    translate: string;
}) {
    return (
        <ResponsiveWrapper
            close={close}
            translate={translate}
            className={clsx(
                'fixed z-20 h-full w-72 border-r bg-neutral-800 py-2 text-neutral-100 transition-all dark:border-neutral-500 md:flex lg:inset-y-0',
                className,
            )}
        >
            <div className="relative flex h-full w-full flex-col items-center justify-start gap-4 pb-2 md:pb-0">
                {children}
            </div>
        </ResponsiveWrapper>
    );
}

function ResponsiveWrapper({
    close,
    children,
    className,
    translate,
}: {
    close: () => void;
    children: React.ReactNode;
    className: string;
    translate: string;
}) {
    return (
        <>
            {/* Desktop */}
            <div className={clsx('hidden md:block', className, translate)}>
                {children}
            </div>
            {/* Mobile */}
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log('clicked');
                    close();
                }}
                className={clsx(
                    'fixed z-10 h-full w-full transition-all md:hidden',
                    translate,
                )}
            >
                <div onClick={(e) => e.stopPropagation()} className={className}>
                    {children}
                </div>
            </div>
        </>
    );
}
