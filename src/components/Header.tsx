"use client";

import { useChatCtx } from "@/providers/ChatProvider";
import { useConfigDispatch } from "@/providers/ConfigProvider";
import { Bars } from "./Icons";

export default function Header() {
	const { activeThread } = useChatCtx();
	const dispatch = useConfigDispatch();

	const handleSidebarToggle = () => {
		dispatch({ type: "TOGGLE_SIDEBAR" });
	};

	return (
		<div className="grid grid-cols-12 px-2 py-4 border-b shadow border-neutral-300 dark:bg-neutral-900/75 dark:border-neutral-500 bg-neutral-50">
			<div
				className="col-span-1 cursor-pointer"
				onClick={handleSidebarToggle}
			>
				<Bars />
			</div>
			<p className="col-span-10 font-semibold text-center">
				{activeThread.title}
			</p>
		</div>
	);
}
