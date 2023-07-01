"use client";

import { useChatCtx } from "@/providers/ChatProvider";
import { useConfig, useConfigDispatch } from "@/providers/ConfigProvider";
import { Bars, Information } from "./Icons";
import clsx from "clsx";
import { isMobile } from "@/utils";

export default function Header() {
	const { sideBarOpen } = useConfig();
	const { activeThread } = useChatCtx();
	const dispatch = useConfigDispatch();

	const handleSidebarToggle = () => {
		dispatch({ type: "TOGGLE_SIDEBAR" });
	};

	const handleAgentEditorToggle = () => {
		dispatch({ type: "TOGGLE_AGENT_EDITOR" });
	};

	return (
		<div className="grid w-full grid-cols-12 px-2 py-4 border-b shadow border-neutral-300 dark:bg-neutral-900/75 dark:border-neutral-500 bg-neutral-50">
			<button
				className={clsx(
					"col-span-1 cursor-pointer",
					sideBarOpen && isMobile() && "hidden sm:flex"
				)}
				onClick={handleSidebarToggle}
			>
				<Bars />
			</button>
			<p className="col-span-10 font-semibold text-center">
				{activeThread.title}
			</p>
			<button
				className="flex justify-end col-span-1 cursor-pointer"
				onClick={handleAgentEditorToggle}
			>
				<Information />
			</button>
		</div>
	);
}
