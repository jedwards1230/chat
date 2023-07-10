"use client";

import clsx from "clsx";

import { useChat, useChatDispatch } from "@/providers/ChatProvider";
import { motion } from "framer-motion";

export function ChatPlaceholder({ open }: { open: boolean }) {
	const { activeThread } = useChat();
	const dispatch = useChatDispatch();

	const activeModel = activeThread.agentConfig.model;

	return (
		<div className="relative flex flex-col items-center justify-start w-full h-full gap-8 py-2 select-none">
			<div className="flex flex-col items-center w-full gap-4">
				<div className="flex flex-col items-center justify-center gap-4">
					<div className="flex p-1 rounded-lg bg-neutral-200 dark:bg-neutral-900">
						<div className="relative flex flex-row gap-4 group">
							<button
								className={clsx(
									"flex-1 z-10 px-4 py-2 w-32 font-medium text-center rounded-lg",
									activeModel === "gpt-3.5-turbo-16k" ||
										activeModel === "gpt-3.5-turbo"
										? "text-neutral-700 dark:text-white"
										: "text-neutral-400 dark:text-neutral-400"
								)}
								onClick={() =>
									dispatch({
										type: "CHANGE_MODEL",
										payload: {
											model: "gpt-3.5-turbo-16k",
											threadId: activeThread.id,
										},
									})
								}
							>
								GPT-3.5
							</button>
							<button
								className={clsx(
									"flex-1 z-10 px-4 py-2 w-32 font-medium text-center rounded-lg",
									activeModel === "gpt-4" ||
										activeModel === "gpt-4-0613"
										? "text-neutral-700 dark:text-white"
										: "text-neutral-400 dark:text-neutral-400"
								)}
								onClick={() =>
									dispatch({
										type: "CHANGE_MODEL",
										payload: {
											model: "gpt-4",
											threadId: activeThread.id,
										},
									})
								}
							>
								GPT-4
							</button>
							<motion.div
								layoutId="config-tab"
								className={clsx(
									"absolute top-0 w-32 sm:group-hover:dark:bg-neutral-600 bg-neutral-100 dark:bg-neutral-600/40 h-full rounded-lg",
									activeModel === "gpt-3.5-turbo-16k" ||
										activeModel === "gpt-3.5-turbo"
										? "left-0"
										: "right-0"
								)}
							/>
						</div>
					</div>
				</div>
				{open && <Config />}
			</div>
			<Title />
		</div>
	);
}

export function Title() {
	const { activeThread } = useChat();

	return (
		<div className="absolute inset-x-auto inset-y-auto flex flex-col items-center justify-center h-full gap-2">
			<div className="text-4xl font-medium text-center">
				{activeThread.agentConfig.name}
			</div>
			<div className="italic text-neutral-500 line-clamp-1">
				System: {activeThread.agentConfig.systemMessage}
			</div>
		</div>
	);
}

export function Config() {
	const { activeThread, pluginsEnabled } = useChat();
	const dispatch = useChatDispatch();
	const availableTools: Tool[] = ["calculator", "search"];

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
		{
			label: "Stop Sequences",
			value: activeThread.agentConfig.stop.join(", "),
		},
	];

	return (
		<>
			<div className="z-10 flex flex-col justify-center w-full max-w-lg gap-4 p-3 border bg-neutral-200 dark:bg-neutral-800 border-neutral-600">
				<div>
					{modelInfo.map((info) => (
						<div
							key={info.label}
							className="text-sm text-neutral-600 dark:text-neutral-400"
						>
							{info.label}: {info.value}
						</div>
					))}
				</div>
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
									activeThread.agentConfig.tools.includes(
										plugin
									);
								return (
									<label
										key={plugin}
										className="flex items-center justify-between w-full p-1 text-sm rounded cursor-pointer dark:hover:bg-neutral-600 hover:bg-neutral-200"
									>
										<span className="capitalize">
											{plugin}
										</span>
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
		</>
	);
}
