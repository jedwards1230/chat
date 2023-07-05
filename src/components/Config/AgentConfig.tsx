"use client";

import { useChat, useChatDispatch } from "@/providers/ChatProvider";
import { Select } from "../Forms";

export default function AgentConfig() {
	const { activeThread } = useChat();
	const dispatch = useChatDispatch();
	return (
		<>
			<Select
				label="Model"
				value={activeThread.agentConfig.model}
				options={[
					{ label: "gpt-3.5-turbo", value: "gpt-3.5-turbo" },
					{ label: "gpt-3.5-turbo-16k", value: "gpt-3.5-turbo-16k" },
					{ label: "gpt-4", value: "gpt-4" },
					{ label: "gpt-4-0613", value: "gpt-4-0613" },
				]}
				onChange={(e) => {
					dispatch({
						type: "CHANGE_MODEL",
						payload: {
							threadId: activeThread.id,
							model: e.target.value as Model,
						},
					});
				}}
			/>
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
						dispatch({
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
						dispatch({
							type: "CHANGE_SYSTEM_MESSAGE",
							payload: e.target.value,
						});
					}}
				/>
			</label>
		</>
	);
}
