"use client";

import clsx from "clsx";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function ProfilePicture({ message }: { message: Message }) {
	const { data: session } = useSession();
	const imgSrc = session?.user?.image;

	if (message.role === "user" && imgSrc) {
		return (
			<div className="flex items-start justify-end h-full my-1">
				<Image
					src={imgSrc}
					alt="Profile Picture"
					className="w-8 h-8 rounded"
					width={32}
					height={32}
				/>
			</div>
		);
	}

	return (
		<div className="flex items-start justify-end h-full my-1">
			<div
				className={clsx(
					"border rounded w-8 h-8 select-none transition-colors dark:border-neutral-400 items-center justify-center flex",
					message.role === "user"
						? "bg-neutral-300 dark:bg-neutral-600"
						: message.role === "assistant"
						? "bg-green-500 text-neutral-900 dark:text-neutral-50"
						: "bg-purple-500 text-neutral-900 dark:text-neutral-50"
				)}
				title={
					message.role === "user"
						? "You"
						: message.role === "assistant"
						? "Assistant"
						: "Function"
				}
			>
				{message.role[0].toUpperCase()}
			</div>
		</div>
	);
}
