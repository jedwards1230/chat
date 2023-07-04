"use client";

import ChatBubble from "./ChatBubble";
import { useChat, useChatDispatch } from "../providers/ChatProvider";
import Header from "./Header";
import ChatInput from "./ChatInput";
import clsx from "clsx";

export default function Chat() {
	const { activeThread, pluginsEnabled, sideBarOpen } = useChat();
	const dispatch = useChatDispatch();

	const handleAgentEditorToggle = () => {
		dispatch({ type: "TOGGLE_AGENT_EDITOR" });
	};

	const handlePluginsEditorToggle = () => {
		dispatch({ type: "TOGGLE_PLUGINS_EDITOR" });
	};

	return (
		<div
			className={clsx(
				"flex flex-col transition-all w-full h-full",
				sideBarOpen ? "sm:pl-80" : "lg:pl-0"
			)}
		>
			<Header />
			<div className="flex flex-col items-center justify-center w-full h-full max-w-full overflow-y-scroll grow-1">
				<div className="flex flex-col w-full h-full max-w-4xl gap-4 p-2 mx-auto">
					{activeThread.messages.length > 1 ? (
						activeThread.messages.map((m) => (
							<ChatBubble key={m.id} message={m} />
						))
					) : (
						<div className="flex flex-col items-center justify-start w-full h-full select-none">
							<div className="flex flex-col gap-2 pt-12 pb-48">
								<div className="text-4xl font-medium text-center">
									{activeThread.agentConfig.name}
								</div>
								<div className="italic text-neutral-500 line-clamp-1">
									{activeThread.agentConfig.systemMessage}
								</div>
							</div>
							<div className="flex items-center justify-center gap-4">
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
										<div className="font-semibold ">
											Plugins
										</div>
										<div className="text-xs text-neutral-600 dark:text-neutral-400">
											{
												activeThread.agentConfig.tools
													.length
											}{" "}
											enabled
										</div>
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
