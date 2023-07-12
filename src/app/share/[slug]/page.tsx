import { redis } from "@/lib/redis";
import { notFound } from "next/navigation";

import { SharedBubble } from "@/components/ChatBubble";
import { Metadata } from "next";

export const runtime = "edge";

type Props = {
	params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const shareData: ChatThread | null | undefined = await redis.get(
		"share_" + params.slug
	);
	if (!shareData) {
		return {
			title: "Chat not found",
		};
	}

	return {
		title: shareData.title,
	};
}

export default async function Page({ params }: Props) {
	const shareData: ChatThread | null | undefined = await redis.get(
		"share_" + params.slug
	);
	if (!shareData) {
		notFound();
	}

	const thread: ChatThread = {
		...shareData,
		created: new Date(shareData.created),
		lastModified: new Date(shareData.lastModified),
		messages: JSON.parse(shareData.messages as any),
	};

	return (
		<div className="flex flex-col w-full h-full overflow-hidden transition-all">
			<div className="flex flex-col items-center justify-center w-full h-full max-w-full overflow-y-scroll grow-1">
				<div className="flex flex-col w-full h-full gap-4 p-2 mx-auto lg:max-w-4xl">
					{thread.messages.map((m) => (
						<SharedBubble
							key={m.id}
							message={m}
							config={shareData.agentConfig}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
