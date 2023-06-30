"use client";

import { useChatCtx } from "@/providers/ChatProvider";
import ChatHistoryEntry from "./ChatHistoryEntry";
import { useConfig, useConfigDispatch } from "@/providers/ConfigProvider";
import { XMark } from "./Icons";
import { useEffect, useRef } from "react";
import { isMobile } from "@/app/utils";

export default function ChatHistory() {
	const { threadList, createNewThread } = useChatCtx();
	const config = useConfig();
	const dispatch = useConfigDispatch();
	const sidebarRef = useRef<HTMLDivElement>(null);

	const closeSidebar = () => {
		dispatch({ type: "TOGGLE_SIDEBAR", payload: false });
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

	if (!config.sideBarOpen) return null;
	return (
		<div
			ref={sidebarRef}
			className="fixed h-full max-w-xs py-2 border-r sm:max-w-sm sm:static dark:border-neutral-500 w-96 text-neutral-100 bg-neutral-800 dark:bg-neutral-700"
		>
			<div className="relative flex flex-col items-center justify-start w-full h-full gap-2">
				<button
					className="w-[95%] py-2 transition-colors bg-neutral-600 hover:bg-neutral-500 rounded-md font-semibold"
					onClick={createNewThread}
				>
					Create New Thread
				</button>
				<div className="flex flex-col-reverse w-full px-1">
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
					className="absolute text-black top-2 -right-8 md:hidden"
				>
					<XMark />
				</button>
			</div>
		</div>
	);
}
