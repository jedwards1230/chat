"use client";

import { useChat, useChatDispatch } from "@/providers/ChatProvider";
import Dialog from "./Dialog";

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
			<div className="w-full text-center">
				Share URL
				<input
					type="text"
					readOnly
					className="w-full px-2 py-1 mt-2 border rounded-lg focus:outline-none"
					value={shareUrl}
				/>
			</div>
		</Dialog>
	);
}
