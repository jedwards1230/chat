import { Chat } from '@/components';

export const revalidate = 0;
export const runtime = 'edge';

export default async function Page({
    params,
}: {
    params?: { root?: string[] };
}) {
    return <Chat />;
}
