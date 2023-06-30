"use client";

import { useChatCtx, useChatDispatch } from "@/providers/ChatProvider";
import { useConfig, useConfigDispatch } from "@/providers/ConfigProvider";
import Dialog from "./Dialog";

export default function AgentEditor() {
	const { agentEditorOpen } = useConfig();
	const configDispatch = useConfigDispatch();
	const { activeThread } = useChatCtx();
	const chatDispatch = useChatDispatch();

	if (!agentEditorOpen) return null;
	return (
		<Dialog
			callback={() =>
				configDispatch({
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
		</Dialog>
	);
}
