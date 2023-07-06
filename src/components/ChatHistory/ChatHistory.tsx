"use client";

import { useEffect, useRef } from "react";

import { useChat, useChatDispatch } from "@/providers/ChatProvider";
import ChatHistoryEntry from "./ChatHistoryEntry";
import { Settings } from "../Icons";
import { isMobile } from "@/utils.client";
import clsx from "clsx";

export default function ChatHistory() {
	const { threadList, sideBarOpen } = useChat();
	const dispatch = useChatDispatch();
	const sidebarRef = useRef<HTMLDivElement>(null);

	const closeSidebar = () => {
		dispatch({ type: "SET_SIDEBAR_OPEN", payload: false });
	};

	const openConfig = () => {
		dispatch({ type: "SET_CONFIG_EDITOR_OPEN", payload: true });
		dispatch({ type: "SET_SIDEBAR_OPEN", payload: false });
	};

	const newThread = () => {
		dispatch({ type: "CREATE_THREAD" });
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

	const sortedThreadList = threadList.sort(
		(a, b) => b.lastModified.getTime() - a.lastModified.getTime()
	);

	return (
		<div
			ref={sidebarRef}
			className={clsx(
				"z-30 h-full transition-all fixed lg:inset-y-0 lg:flex w-72 max-w-xs min-w-[270px] py-2 border-r sm:z-auto dark:border-neutral-500 text-neutral-100 bg-neutral-800",
				sideBarOpen ? "-translate-x-0" : "-translate-x-full"
			)}
		>
			<div className="relative flex flex-col items-center justify-start w-full h-full gap-4 px-2">
				<div className="flex justify-between w-full gap-x-2">
					<button
						className="flex-1 py-2 font-medium transition-colors border rounded-lg hover:bg-neutral-600 border-neutral-500 hover:border-neutral-400"
						onClick={newThread}
					>
						New Chat
					</button>
					<button
						className="p-2 font-semibold transition-colors border rounded-lg hover:bg-neutral-600 border-neutral-500 hover:border-neutral-400"
						onClick={openConfig}
					>
						<Settings />
					</button>
				</div>
				<div className="flex flex-col w-full gap-1 overflow-y-scroll">
					{sortedThreadList &&
						sortedThreadList.map((m, i) => (
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
