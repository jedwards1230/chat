"use client";

import { Clipboard, Edit, Trash } from "@/components/Icons";
import { useChat, useChatDispatch } from "@/providers/ChatProvider";
import ChatBubbleFunction from "./ChatBubbleFunction";

export function ChatBubbleFunctionList({ message }: { message: Message }) {
	const { activeThread } = useChat();
	const dispatch = useChatDispatch();
	const isSystem = message.role === "system";

	return (
		<div className="absolute bottom-0 hidden gap-4 group-hover:flex right-2">
			<ChatBubbleFunction
				icon={<Edit />}
				color="blue"
				title={"Edit Message"}
				onClick={() => {
					isSystem
						? dispatch({
								type: "TOGGLE_AGENT_EDITOR",
								payload: true,
						  })
						: dispatch({
								type: "EDIT_MESSAGE",
								payload: {
									threadId: activeThread.id,
									messageId: message.id,
								},
						  });
				}}
			/>
			{!isSystem && (
				<ChatBubbleFunction
					icon={<Trash />}
					color="red"
					title={"Delete Message"}
					onClick={() => {
						dispatch({
							type: "REMOVE_MESSAGE",
							payload: {
								threadId: activeThread.id,
								messageId: message.id,
							},
						});
					}}
				/>
			)}
			{!isSystem && (
				<ChatBubbleFunction
					title={"Copy"}
					onClick={() => {
						navigator.clipboard.writeText(message.content);
					}}
					icon={<Clipboard />}
				/>
			)}
		</div>
	);
}
