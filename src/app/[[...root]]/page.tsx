import { Chat } from '@/components';

export const revalidate = 0;

export default async function Page({
    params,
}: {
    params?: { root?: string[] };
}) {
    return <Chat />;
}
