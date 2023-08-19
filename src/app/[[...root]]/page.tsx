import { Chat } from '@/components';

export default async function Page({
    params,
}: {
    params?: { root?: string[] };
}) {
    return <Chat />;
}
