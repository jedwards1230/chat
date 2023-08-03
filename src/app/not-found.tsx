import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex h-full w-full flex-col items-center justify-start gap-48 py-24">
            <h2 className="text-6xl font-medium">Not Found</h2>
            <p className="text-xl">
                Go{' '}
                <Link replace={true} className="text-blue-500" href="/">
                    Home
                </Link>
            </p>
        </div>
    );
}
