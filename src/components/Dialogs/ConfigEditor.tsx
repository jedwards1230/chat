"use client";

import { useConfig, useConfigDispatch } from "@/providers/ConfigProvider";
import Dialog from "./Dialog";
import { useChatCtx, useChatDispatch } from "@/providers/ChatProvider";

export default function ConfigEditor() {
	const { configEditorOpen } = useConfig();
	const { createNewThread } = useChatCtx();
	const chatDispatch = useChatDispatch();
	const configDispatch = useConfigDispatch();

	const clearAll = () => {
		chatDispatch({ type: "CLEAR_HISTORY" });
		createNewThread();
	};

	if (!configEditorOpen) return null;
	return (
		<Dialog
			callback={() =>
				configDispatch({
					type: "TOGGLE_CONFIG_EDITOR",
					payload: false,
				})
			}
		>
			<div className="w-full pb-4 text-xl font-medium text-center">
				Config Editor
			</div>
			<label className="flex items-center justify-between w-full py-2">
				<button
					onClick={clearAll}
					className="w-full py-1.5 bg-red-500 rounded text-neutral-50"
				>
					Clear Local Storage
				</button>
			</label>
		</Dialog>
	);
}
