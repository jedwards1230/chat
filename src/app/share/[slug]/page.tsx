import { redis } from "@/lib/redis";
import { notFound } from "next/navigation";

import { SharedBubble } from "@/components/ChatBubble";

export const runtime = "edge";

export default async function Page({ params }: { params: { slug: string } }) {
	const saveData: ChatThread | null | undefined = await redis.get(
		"share_" + params.slug
	);
	if (!saveData) {
		notFound();
	}

	const thread: ChatThread = {
		...saveData,
		created: new Date(saveData.created),
		lastModified: new Date(saveData.lastModified),
		messages: JSON.parse(saveData.messages as any),
	};

	return (
		<div className="flex flex-col w-full h-full overflow-hidden transition-all">
			<div className="flex flex-col items-center justify-center w-full h-full max-w-full overflow-y-scroll grow-1">
				<div className="flex flex-col w-full h-full gap-4 p-2 mx-auto lg:max-w-4xl">
					{thread.messages.map((m) => (
						<SharedBubble key={m.id} message={m} />
					))}
				</div>
			</div>
		</div>
	);
}
