"use client";

import { useChat, useChatDispatch } from "@/providers/ChatProvider";
import { Bars, Information } from "./Icons";
import clsx from "clsx";
import { isMobile } from "@/utils";

export default function Header() {
	const { activeThread, sideBarOpen } = useChat();
	const dispatch = useChatDispatch();

	const handleSidebarToggle = () => {
		dispatch({ type: "TOGGLE_SIDEBAR" });
	};

	const handleAgentEditorToggle = () => {
		dispatch({ type: "TOGGLE_AGENT_EDITOR" });
	};

	return (
		<div className="grid w-full grid-cols-12 px-2 py-2 border-b shadow border-neutral-300 dark:bg-neutral-900/75 dark:border-neutral-500 bg-neutral-50">
			<div className="flex items-center justify-start col-span-1">
				<button
					className={clsx(
						"text-neutral-400 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-50 cursor-pointer px-1",
						sideBarOpen && isMobile() && "hidden sm:flex"
					)}
					onClick={handleSidebarToggle}
				>
					<Bars />
				</button>
			</div>
			<div
				className={clsx(
					"col-span-10 text-center",
					sideBarOpen && isMobile() && "col-start-2 sm:col-start-1"
				)}
			>
				<p className="font-semibold">{activeThread.title}</p>
				<p className="text-sm font-light text-neutral-500">
					{activeThread.messages.length > 1 ? (
						<>
							{activeThread.agentConfig.model} |{" "}
							{activeThread.messages.length} messages
						</>
					) : (
						<>Start a chat</>
					)}
				</p>
			</div>
			<div className="items-center justify-end hidden col-span-1 ">
				<button
					className="px-1 cursor-pointer text-neutral-400 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-50"
					onClick={handleAgentEditorToggle}
				>
					<Information />
				</button>
			</div>
		</div>
	);
}
