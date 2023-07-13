"use client";

import { useChat, useChatDispatch } from "@/providers/ChatProvider";

export default function Config() {
	const { activeThread, pluginsEnabled } = useChat();
	const dispatch = useChatDispatch();
	const availableTools: Tool[] = ["calculator", "search", "web-browser"];

	const modelInfo = [
		{
			label: "Temperature",
			value: activeThread.agentConfig.temperature,
		},
		{
			label: "Top P",
			value: activeThread.agentConfig.topP,
		},
		{
			label: "N",
			value: activeThread.agentConfig.n,
		},
		{
			label: "Max Tokens",
			value: activeThread.agentConfig.maxTokens,
		},
		{
			label: "Frequency Penalty",
			value: activeThread.agentConfig.frequencyPenalty,
		},
		{
			label: "Presence Penalty",
			value: activeThread.agentConfig.presencePenalty,
		},
	];

	return (
		<div className="z-10 flex flex-col justify-center w-full max-w-lg gap-4 p-3 border bg-neutral-200 dark:bg-neutral-800 border-neutral-600">
			<label className="flex flex-col justify-between w-full gap-2 py-2 text-sm">
				<span>Name</span>
				<input
					className="w-full p-2 border rounded-lg"
					type="text"
					value={activeThread.agentConfig.name}
					onChange={(e) => {
						dispatch({
							type: "SET_SYSTEM_NAME",
							payload: e.target.value,
						});
					}}
				/>
			</label>
			<label className="flex flex-col justify-between w-full gap-2 py-2 text-sm">
				<span>System Message</span>
				<input
					className="w-full p-2 border rounded-lg"
					type="text"
					value={activeThread.agentConfig.systemMessage}
					onChange={(e) => {
						dispatch({
							type: "SET_SYSTEM_MESSAGE",
							payload: e.target.value,
						});
					}}
				/>
			</label>
			<details>
				<summary>Advanced</summary>
				{modelInfo.map((info) => (
					<div
						key={info.label}
						className="flex justify-between w-full text-sm text-neutral-600 dark:text-neutral-400"
					>
						<div>{info.label}:</div>
						<div>{info.value}</div>
					</div>
				))}
			</details>
			<div className="flex flex-col gap-2">
				<div className="flex flex-col px-1">
					<div className="flex items-center justify-between gap-4 dark:border-neutral-600">
						<div className="flex flex-col">
							<div className="font-semibold ">Plugins</div>
						</div>
						<input
							type="checkbox"
							title="Toggle plugins"
							className="w-4 h-4 cursor-pointer"
							checked={pluginsEnabled}
							onChange={() =>
								dispatch({
									type: "TOGGLE_PLUGINS",
								})
							}
						/>
					</div>
					{pluginsEnabled && (
						<div className="text-xs text-neutral-600 dark:text-neutral-400">
							{activeThread.agentConfig.tools.length} enabled
						</div>
					)}
				</div>
				<div>
					{pluginsEnabled &&
						availableTools.map((plugin) => {
							const checked =
								activeThread.agentConfig.tools.includes(plugin);
							return (
								<label
									key={plugin}
									className="flex items-center justify-between w-full p-1 text-sm rounded cursor-pointer dark:hover:bg-neutral-600 hover:bg-neutral-200"
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
				</div>
			</div>
		</div>
	);
}
