"use client";

import { useChat, useChatDispatch } from "@/providers/ChatProvider";
import clsx from "clsx";
import { motion } from "framer-motion";

export default function ChatInput() {
	const { input, handleSubmit, editId } = useChat();
	const dispatch = useChatDispatch();

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		e.preventDefault();
		dispatch({ type: "CHANGE_INPUT", payload: e.target.value });
	};

	const onKeyDownHandler = (e: any) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			dispatch({
				type: "CHANGE_INPUT",
				payload: e.target.value,
			});
			handleSubmit(e);
		}
	};

	const inputRows = (input.match(/\n/g) || []).length + 1;

	return (
		<form
			onSubmit={handleSubmit}
			className={clsx(
				"flex items-center justify-center w-full gap-2 px-4 pt-2 pb-8 border-t shadow-xl sm:pb-4 dark:shadow-none border-neutral-300 dark:border-neutral-600 dark:border-0 justify-self-end",
				editId ? "flex-col" : ""
			)}
		>
			<motion.textarea
				placeholder="Say something..."
				value={input}
				autoFocus
				rows={inputRows > 10 ? 10 : inputRows}
				onChange={handleInputChange}
				onKeyDown={onKeyDownHandler}
				className="flex-1 w-full p-2 border-2 rounded border-neutral-200 focus:border-blue-500 dark:bg-neutral-600 focus:outline-none"
			/>
			{input && editId ? (
				<div className="flex gap-4">
					<button
						className="px-6 py-1.5 text-neutral-50 focus:outline-none transition-colors rounded-lg border border-transparent focus:border-blue-500 focus:bg-blue-400 bg-blue-500 dark:bg-blue-500 hover:bg-blue-400 dark:hover:bg-blue-400"
						type="submit"
					>
						Update and Regenerate
					</button>
					<button
						className="px-6 py-1.5 text-neutral-50 focus:outline-none transition-colors rounded-lg border border-transparent focus:border-green-500 focus:bg-green-400 bg-green-500 dark:bg-green-500 hover:bg-green-400 dark:hover:bg-green-400"
						//onClick={}
					>
						Replace Only
					</button>
					<button
						className="px-6 py-1.5 bg-neutral-300 focus:outline-none transition-colors rounded-lg border border-transparent focus:border-blue-500 focus:bg-neutral-400 dark:bg-neutral-500 hover:bg-neutral-400 dark:hover:bg-neutral-400"
						onClick={() => dispatch({ type: "CANCEL_EDIT" })}
					>
						Cancel
					</button>
				</div>
			) : (
				<button
					className="px-6 py-1.5 text-neutral-50 focus:outline-none transition-colors rounded-lg border border-transparent focus:border-blue-500 focus:bg-blue-400 bg-blue-500 dark:bg-blue-500 hover:bg-blue-400 dark:hover:bg-blue-400"
					type="submit"
				>
					Send
				</button>
			)}
		</form>
	);
}
