"use client";

import ChatBubble from "./ChatBubble";
import { useChat, useChatDispatch } from "../providers/ChatProvider";
import Header from "./Header";
import ChatInput from "./ChatInput";

export default function Chat() {
	const { activeThread } = useChat();
	const dispatch = useChatDispatch();

	const handleAgentEditorToggle = () => {
		dispatch({ type: "TOGGLE_AGENT_EDITOR" });
	};

	//console.log(activeThread.messages);

	return (
		<div className="flex flex-col items-center w-full h-full">
			<Header />
			<div className="flex flex-col items-center w-full h-full overflow-scroll">
				<div className="flex flex-col w-full h-full max-w-4xl p-2">
					{activeThread.messages.length > 1 ? (
						activeThread.messages.map((m) => (
							<ChatBubble key={m.id + m.content} message={m} />
						))
					) : (
						<div className="flex items-center justify-center w-full h-full">
							<div
								onClick={handleAgentEditorToggle}
								className="px-4 py-2 transition-colors border rounded cursor-pointer dark:hover:bg-neutral-700 border-neutral-500 dark:border-neutral-600"
							>
								<div className="font-semibold uppercase">
									{activeThread.agentConfig.model}
								</div>
								<div className="text-xs text-neutral-600 dark:text-neutral-400">
									Temperature:{" "}
									{activeThread.agentConfig.temperature}
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
			<ChatInput />
		</div>
	);
}
