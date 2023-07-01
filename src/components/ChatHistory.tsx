"use client";

import { useChatCtx } from "@/providers/ChatProvider";
import ChatHistoryEntry from "./ChatHistoryEntry";
import { useConfig, useConfigDispatch } from "@/providers/ConfigProvider";
import { Settings, XMark } from "./Icons";
import { useEffect, useRef } from "react";
import { isMobile } from "@/utils";

export default function ChatHistory() {
	const { threadList, createNewThread } = useChatCtx();
	const { sideBarOpen } = useConfig();
	const dispatch = useConfigDispatch();
	const sidebarRef = useRef<HTMLDivElement>(null);

	const closeSidebar = () => {
		dispatch({ type: "TOGGLE_SIDEBAR", payload: false });
	};

	const openConfig = () => {
		dispatch({ type: "TOGGLE_CONFIG_EDITOR", payload: true });
	};

	useEffect(() => {
		const handleClickOutside = (event: any) => {
			if (
				isMobile() &&
				sidebarRef.current &&
				!sidebarRef.current.contains(event.target)
			) {
				closeSidebar();
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (!sideBarOpen) return null;
	return (
		<div
			ref={sidebarRef}
			className="fixed z-10 h-full max-w-xs py-2 border-r sm:z-auto w-96 lg:w-72 sm:max-w-sm sm:relative dark:border-neutral-500 text-neutral-100 bg-neutral-800 dark:bg-neutral-700"
		>
			<div className="relative flex flex-col items-center justify-start w-full h-full gap-2">
				<div className="flex justify-between w-full px-2 gap-x-2">
					<button
						className="flex-1 py-2 font-semibold transition-colors rounded-md bg-neutral-600 hover:bg-neutral-500"
						onClick={createNewThread}
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
				<div className="flex flex-col-reverse w-full px-1 overflow-y-scroll">
					{threadList &&
						threadList.map((m, i) => (
							<ChatHistoryEntry
								key={`${i}-${m.messages.length}`}
								entry={m}
							/>
						))}
				</div>
				<button
					title="Close Sidebar"
					onClick={closeSidebar}
					className="absolute text-black top-2 -right-8 sm:hidden dark:text-neutral-50"
				>
					<XMark />
				</button>
			</div>
		</div>
	);
}
