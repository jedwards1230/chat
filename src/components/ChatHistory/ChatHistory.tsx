"use client";

import { useEffect, useRef, useState } from "react";

import { useChat, useChatDispatch } from "@/providers/ChatProvider";
import ChatHistoryEntry from "./ChatHistoryEntry";
import { Settings } from "../Icons";
import { isMobile } from "@/utils";
import clsx from "clsx";

export default function ChatHistory() {
	const { threadList, sideBarOpen } = useChat();
	const configDispatch = useChatDispatch();
	const chatDispatch = useChatDispatch();
	const sidebarRef = useRef<HTMLDivElement>(null);

	const closeSidebar = () => {
		configDispatch({ type: "TOGGLE_SIDEBAR", payload: false });
	};

	const openConfig = () => {
		configDispatch({ type: "TOGGLE_CONFIG_EDITOR", payload: true });
		configDispatch({ type: "TOGGLE_SIDEBAR", payload: false });
	};

	const newThread = () => {
		chatDispatch({ type: "CREATE_THREAD" });
		if (isMobile()) closeSidebar();
	};

	useEffect(() => {
		const handleClickOutside = (event: any) => {
			if (
				sideBarOpen &&
				isMobile() &&
				sidebarRef.current &&
				!sidebarRef.current.contains(event.target)
			) {
				event.preventDefault();
				closeSidebar();
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("touchstart", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("touchstart", handleClickOutside);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div
			ref={sidebarRef}
			className={clsx(
				"z-20 h-full transition-all fixed lg:inset-y-0 lg:flex lg:w-80 max-w-xs min-w-[270px] py-2 border-r sm:z-auto w-96 dark:border-neutral-500 text-neutral-100 bg-neutral-800 dark:bg-neutral-700",
				sideBarOpen ? "-translate-x-0" : "-translate-x-full"
			)}
		>
			<div className="relative flex flex-col items-center justify-start w-full h-full gap-4">
				<div className="flex justify-between w-full px-2 gap-x-2">
					<button
						className="flex-1 py-2 font-semibold transition-colors rounded-md bg-neutral-600 hover:bg-neutral-500"
						onClick={newThread}
					>
						New Chat
					</button>
					<button
						className="p-2 font-semibold transition-colors rounded-md bg-neutral-600 hover:bg-neutral-500"
						onClick={openConfig}
					>
						<Settings />
					</button>
				</div>
				<div className="flex flex-col-reverse w-full overflow-y-scroll">
					{threadList &&
						threadList.map((m, i) => (
							<ChatHistoryEntry
								key={`${i}-${m.messages.length}`}
								entry={m}
							/>
						))}
				</div>
			</div>
		</div>
	);
}
