"use client";

import { useChat, useChatDispatch } from "@/providers/ChatProvider";
import { calculateRows } from "@/utils";

export default function Title() {
	const { activeThread } = useChat();
	const dispatch = useChatDispatch();

	const rows = calculateRows(activeThread.agentConfig.systemMessage);

	return (
		<div className="absolute inset-x-auto inset-y-auto flex flex-col items-center justify-center h-full gap-2">
			<div className="text-4xl font-medium text-center">
				{activeThread.agentConfig.name}
			</div>
			<div className="flex gap-1 text-neutral-400">
				System:
				<textarea
					rows={rows}
					value={activeThread.agentConfig.systemMessage}
					onChange={(e) =>
						dispatch({
							type: "SET_SYSTEM_MESSAGE",
							payload: e.target.value,
						})
					}
					className="italic bg-transparent border border-transparent rounded resize-none max-h-48 text-neutral-500 focus:border-neutral-500 focus:outline-none"
				/>
			</div>
		</div>
	);
}
