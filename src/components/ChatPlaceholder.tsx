"use client";

import { useChat, useChatDispatch } from "@/providers/ChatProvider";

export function ChatPlaceholder() {
	const { activeThread, pluginsEnabled } = useChat();
	const dispatch = useChatDispatch();

	const handleAgentEditorToggle = () => {
		dispatch({ type: "TOGGLE_AGENT_EDITOR" });
	};

	const handlePluginsEditorToggle = () => {
		dispatch({ type: "TOGGLE_PLUGINS_EDITOR" });
	};

	return (
		<div className="relative flex flex-col items-center justify-center w-full h-full select-none">
			<div className="absolute inset-x-auto flex items-center justify-center gap-4 top-4">
				<div
					onClick={handleAgentEditorToggle}
					className="px-4 py-2 transition-colors border rounded cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700 border-neutral-500 dark:border-neutral-600"
				>
					<div className="font-semibold uppercase">
						{activeThread.agentConfig.model}
					</div>
					<div className="text-xs text-neutral-600 dark:text-neutral-400">
						Temperature: {activeThread.agentConfig.temperature}
					</div>
				</div>
				<div className="flex items-center transition-colors border divide-x-2 rounded dark:divide-neutral-600 border-neutral-500 dark:border-neutral-600">
					<div className="px-4 dark:border-neutral-600">
						<input
							type="checkbox"
							className="w-4 h-4 cursor-pointer"
							checked={pluginsEnabled}
							onChange={() =>
								dispatch({
									type: "TOGGLE_PLUGINS",
								})
							}
						/>
					</div>
					<div
						onClick={handlePluginsEditorToggle}
						className="flex flex-col items-center justify-center px-4 py-2 transition-colors cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700"
					>
						<div className="font-semibold ">Plugins</div>
						<div className="text-xs text-neutral-600 dark:text-neutral-400">
							{activeThread.agentConfig.tools.length} enabled
						</div>
					</div>
				</div>
			</div>
			<div className="flex flex-col gap-2">
				<div className="text-4xl font-medium text-center">
					{activeThread.agentConfig.name}
				</div>
				<div className="italic text-neutral-500 line-clamp-1">
					System: {activeThread.agentConfig.systemMessage}
				</div>
			</div>
		</div>
	);
}
