"use client";

import clsx from "clsx";

import { useChat, useChatDispatch } from "@/providers/ChatProvider";
import { motion } from "framer-motion";
import Title from "./Title";
import Config from "./Config";

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
