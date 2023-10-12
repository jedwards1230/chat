'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

export default function NotFound() {
    const router = useRouter();
    return (
        <div className="flex h-full w-full flex-col items-center justify-start gap-24 py-24">
            <h2 className="text-6xl font-medium">Not Found</h2>
            <p className="text-lg">
                <Button
                    className="text-lg"
                    variant="link"
                    size="xs"
                    onClick={() => router.replace('/')}
                >
                    Home
                </Button>{' '}
                |{' '}
                <Button
                    className="text-lg"
                    variant="link"
                    size="xs"
                    onClick={() => router.refresh()}
                >
                    Refresh
                </Button>
            </p>
        </div>
    );
}
