"use client";

import { useChat, useChatDispatch } from "@/providers/ChatProvider";
import Dialog from "./Dialog";

export default function PluginsEditor() {
	const { activeThread } = useChat();
	const chatDispatch = useChatDispatch();

	return (
		<Dialog
			callback={() =>
				chatDispatch({
					type: "TOGGLE_PLUGINS_EDITOR",
					payload: false,
				})
			}
		>
			<div className="w-full pb-4 text-xl font-medium text-center">
				Plugins Editor
			</div>
			{["calculator", "search"].map((plugin) => {
				const checked = activeThread.agentConfig.tools.includes(
					plugin as Tool
				);
				return (
					<label
						key={plugin}
						className="flex items-center justify-between w-full px-4 py-2 hover:bg-neutral-200"
					>
						<span className="capitalize">{plugin}</span>
						<input
							className="p-2 border rounded-lg cursor-pointer"
							type="checkbox"
							checked={checked}
							onChange={() => {
								chatDispatch({
									type: "TOGGLE_PLUGIN",
									payload: plugin as Tool,
								});
							}}
						/>
					</label>
				);
			})}
		</Dialog>
	);
}
