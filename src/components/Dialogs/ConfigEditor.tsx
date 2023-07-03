"use client";

import clsx from "clsx";
import { useState } from "react";
import { signOut } from "next-auth/react";

import Dialog from "./Dialog";
import { useChat, useChatDispatch } from "@/providers/ChatProvider";
import { getChatHistory } from "@/utils";

export default function ConfigEditor() {
	const { threadList, configEditorOpen, userId, userIdRequired } = useChat();
	const dispatch = useChatDispatch();
	const [userIdInput, setUserIdInput] = useState(userId);

	const clearAll = () => {
		dispatch({ type: "CLEAR_HISTORY" });
		dispatch({ type: "CREATE_THREAD" });
	};

	if (!configEditorOpen) return null;
	return (
		<Dialog
			callback={() =>
				dispatch({
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

				{/* Credentials */}
				<div>
					<div className="text-xl font-medium">Credentials</div>
					<label className="flex flex-col justify-between w-full gap-2 py-2">
						<span>User ID</span>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								dispatch({
									type: "CHANGE_USER_ID",
									payload: userIdInput,
								});
								getChatHistory(userIdInput).then((history) => {
									if (history) {
										dispatch({
											type: "INITIALIZE",
											payload: {
												...history,
											},
										});
									}
								});
							}}
							className="flex gap-4"
						>
							<input
								className={clsx(
									"w-full p-2 focus:outline-none border rounded-lg",
									userIdRequired && userId === ""
										? "border-red-500"
										: "border-neutral-500"
								)}
								type="text"
								value={userIdInput}
								required={userIdRequired}
								onChange={(e) => setUserIdInput(e.target.value)}
							/>
							<button
								type="submit"
								className="py-1.5 px-3 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 rounded text-neutral-50"
							>
								Save
							</button>
						</form>
					</label>
				</div>

				{/* Auth */}
				<div>
					<div className="text-xl font-medium">Auth</div>
					<label className="flex items-center justify-between w-full py-2 text-base">
						<button
							onClick={() => signOut()}
							className="w-full py-1.5 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 rounded text-neutral-50"
						>
							Sign Out
						</button>
					</label>
				</div>

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
