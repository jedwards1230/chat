"use client";

import Dialog from "./Dialog";
import { useChat, useChatDispatch } from "@/providers/ChatProvider";

export default function ConfigEditor() {
	const { threadList, configEditorOpen } = useChat();
	const chatDispatch = useChatDispatch();
	const configDispatch = useChatDispatch();

	const clearAll = () => {
		chatDispatch({ type: "CLEAR_HISTORY" });
		chatDispatch({ type: "CREATE_THREAD" });
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
			<div className="w-full pb-4 text-xl font-semibold text-center">
				App Settings
			</div>

			<div className="flex flex-col gap-4">
				{/* Model */}
				{/* <div>
					<div className="text-xl font-medium">Model</div>
					<div></div>
				</div> */}

				{/* Data */}
				<div>
					<div className="text-xl font-medium">Data</div>
					<div className="flex gap-2">
						<div>{threadList.length} Chats</div>|
						<div>
							{threadList.reduce(
								(acc, thread) => acc + thread.messages.length,
								0
							)}{" "}
							Messages
						</div>
					</div>
					<label className="flex items-center justify-between w-full py-2 text-base">
						<button
							onClick={clearAll}
							className="w-full py-1.5 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 rounded text-neutral-50"
						>
							Clear Local Storage
						</button>
					</label>
				</div>
			</div>
		</Dialog>
	);
}
