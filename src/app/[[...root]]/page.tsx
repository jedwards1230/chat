import { Chat } from '@/components';

export const runtime = 'edge';

export default async function Page({
    params,
}: {
    params?: { root?: string[] };
}) {
    return <Chat />;
}
