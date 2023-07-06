"use client";

import clsx from "clsx";
import Dialog from "./Dialog";
import { useChat, useChatDispatch } from "@/providers/ChatProvider";
import { useState } from "react";
import { getChatHistory } from "@/utils";
import { Select } from "../Forms";

export default function ConfigEditor() {
	const { threadList, configEditorOpen, userId, userIdRequired, config } =
		useChat();
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
					type: "SET_CONFIG_EDITOR_OPEN",
					payload: false,
				})
			}
		>
			<div className="w-full pb-4 text-xl font-semibold text-center">
				App Settings
			</div>

			<div className="flex flex-col gap-4">
				{/* Default Model */}
				<Select
					label="Default Model"
					value={config.defaultModel}
					options={[
						{ label: "gpt-3.5-turbo", value: "gpt-3.5-turbo" },
						{
							label: "gpt-3.5-turbo-16k",
							value: "gpt-3.5-turbo-16k",
						},
						{ label: "gpt-4", value: "gpt-4" },
						{ label: "gpt-4-0613", value: "gpt-4-0613" },
					]}
					onChange={(e) => {
						dispatch({
							type: "UPDATE_CONFIG",
							payload: {
								...config,
								defaultModel: e.target.value as Model,
							},
						});
					}}
				/>

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
