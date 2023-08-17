import { SignIn } from '@clerk/nextjs';

export const runtime = 'edge';

export default function Page() {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <SignIn />
        </div>
    );
}
