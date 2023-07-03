"use client";

import ChatBubble from "./ChatBubble";
import { useChat, useChatDispatch } from "../providers/ChatProvider";
import Header from "./Header";
import ChatInput from "./ChatInput";
import { useEffect, useRef } from "react";

export default function Chat() {
	const { activeThread } = useChat();
	const dispatch = useChatDispatch();

	const handleAgentEditorToggle = () => {
		dispatch({ type: "TOGGLE_AGENT_EDITOR" });
	};

	const handlePluginsEditorToggle = () => {
		dispatch({ type: "TOGGLE_PLUGINS_EDITOR" });
	};

	return (
		<div className="flex flex-col items-center w-full h-full">
			<Header />
			<div className="flex flex-col items-center w-full h-full overflow-scroll">
				<div className="flex flex-col w-full h-full max-w-4xl p-2">
					{activeThread.messages.length > 1 ? (
						activeThread.messages.map((m) => (
							<ChatBubble key={m.id} message={m} />
						))
					) : (
						<div className="flex items-center justify-center w-full h-full gap-4">
							<div
								onClick={handleAgentEditorToggle}
								className="px-4 py-2 transition-colors border rounded cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700 border-neutral-500 dark:border-neutral-600"
							>
								<div className="font-semibold uppercase">
									{activeThread.agentConfig.model}
								</div>
								<div className="text-xs text-neutral-600 dark:text-neutral-400">
									Temperature:{" "}
									{activeThread.agentConfig.temperature}
								</div>
							</div>
							<div className="flex items-center transition-colors border divide-x-2 rounded border-neutral-500 dark:border-neutral-600">
								<div className="px-2 dark:border-neutral-600">
									Toggle
								</div>
								<div
									onClick={handlePluginsEditorToggle}
									className="flex flex-col items-center justify-center px-4 py-2 transition-colors cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700"
								>
									<div className="font-semibold ">
										Plugins
									</div>
									<div className="text-xs text-neutral-600 dark:text-neutral-400">
										{activeThread.agentConfig.tools.length}{" "}
										enabled
									</div>
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
