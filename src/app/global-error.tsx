'use client';

export const runtime = 'edge';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body className="mx-auto flex h-full w-[50vw] flex-col items-center justify-start gap-24 bg-background py-24 text-foreground transition-colors">
                <h2 className="text-5xl font-medium">Something went wrong!</h2>
                <p>{error.message}</p>
                <p>{error.digest}</p>
                <p className="text-xl">
                    Go <button onClick={() => reset()}>Try again</button>
                </p>
            </body>
        </html>
    );
}
