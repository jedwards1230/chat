"use client";

import Link from "next/link";

import { useChat, useChatDispatch } from "@/providers/ChatProvider";
import Dialog from "./Dialog";
import { OpenNew } from "../Icons";

export default function ShareChat() {
	const { activeThread } = useChat();
	const chatDispatch = useChatDispatch();

	const shareUrl = `${window.location.origin}/share/${activeThread.id}`;

	return (
		<Dialog
			callback={() =>
				chatDispatch({
					type: "SET_SHARE_MODAL_OPEN",
					payload: false,
				})
			}
		>
			<div className="w-full text-lg text-center">
				Share URL
				<div className="flex items-center justify-between gap-2 mt-2">
					<input
						type="text"
						readOnly
						className="w-full px-2 py-1 border rounded-lg focus:outline-none"
						value={shareUrl}
					/>
					<Link
						href={shareUrl}
						target="_blank"
						className="flex items-center justify-center p-1.5 bg-green-600 dark:hover:bg-green-600/80 rounded-lg"
					>
						<OpenNew />
					</Link>
				</div>
			</div>
		</Dialog>
	);
}
