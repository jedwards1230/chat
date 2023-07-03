"use client";

import { useChat, useChatDispatch } from "@/providers/ChatProvider";
import Dialog from "./Dialog";

export default function AgentEditor() {
	const { activeThread, agentEditorOpen } = useChat();
	const chatDispatch = useChatDispatch();

	if (!agentEditorOpen) return null;
	return (
		<Dialog
			callback={() =>
				chatDispatch({
					type: "TOGGLE_AGENT_EDITOR",
					payload: false,
				})
			}
		>
			<div className="w-full pb-4 text-xl font-medium text-center">
				Agent Editor
			</div>
			<label className="flex items-center justify-between w-full py-2">
				<span>Model</span>
				<select
					className="p-2 ml-2 border rounded-lg"
					value={activeThread.agentConfig.model}
					onChange={(e) => {
						chatDispatch({
							type: "CHANGE_MODEL",
							payload: {
								threadId: activeThread.id,
								model: e.target.value as Model,
							},
						});
					}}
				>
					<option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
					<option value="gpt-3.5-turbo-16k">gpt-3.5-turbo-16k</option>
					<option value="gpt-4">gpt-4</option>
				</select>
			</label>
			<label className="flex items-center justify-between w-full py-2">
				<span>Temperature</span>
				<input
					className="w-16 p-2 ml-2 border rounded-lg"
					type="number"
					min="0"
					max="1"
					step="0.1"
					value={activeThread.agentConfig.temperature}
					onChange={(e) => {
						const val = Number(e.target.value);
						if (val < 0 || val > 1) return;
						chatDispatch({
							type: "CHANGE_TEMPERATURE",
							payload: val,
						});
					}}
				/>
			</label>
			<label className="flex flex-col justify-between w-full gap-2 py-2">
				<span>System Message</span>
				<input
					className="w-full p-2 border rounded-lg"
					type="text"
					value={activeThread.agentConfig.systemMessage}
					onChange={(e) => {
						chatDispatch({
							type: "CHANGE_SYSTEM_MESSAGE",
							payload: e.target.value,
						});
					}}
				/>
			</label>
		</Dialog>
	);
}
