"use client";

import { useChat, useChatDispatch } from "@/providers/ChatProvider";

export default function PluginsConfig() {
	const { activeThread } = useChat();
	const dispatch = useChatDispatch();
	const availableTools: Tool[] = ["calculator", "search"];

	return (
		<>
			{availableTools.map((plugin) => {
				const checked = activeThread.agentConfig.tools.includes(plugin);
				return (
					<label
						key={plugin}
						className="flex items-center justify-between w-full px-4 py-2 cursor-pointer dark:hover:bg-neutral-600 hover:bg-neutral-200"
					>
						<span className="capitalize">{plugin}</span>
						<input
							className="p-2 border rounded-lg"
							type="checkbox"
							checked={checked}
							onChange={() => {
								dispatch({
									type: "TOGGLE_PLUGIN",
									payload: plugin as Tool,
								});
							}}
						/>
					</label>
				);
			})}
		</>
	);
}
