"use client";

import { useChatCtx, useChatDispatch } from "@/providers/ChatProvider";
import { motion } from "framer-motion";

export default function ChatInput() {
	const { input, handleSubmit } = useChatCtx();
	const dispatch = useChatDispatch();

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		e.preventDefault();
		dispatch({ type: "CHANGE_INPUT", payload: e.target.value });
	};

	const inputRows = (input.match(/\n/g) || []).length + 1;

	return (
		<form
			onSubmit={handleSubmit}
			className="flex items-center justify-center w-full gap-2 px-4 pt-2 pb-8 border-t shadow-xl sm:pb-4 dark:shadow-none border-neutral-300 dark:border-neutral-600 dark:border-0 justify-self-end "
		>
			<motion.textarea
				initial={{ padding: "0.75rem", opacity: 0 }}
				whileFocus={{ padding: "1rem", opacity: 1 }}
				animate={{ padding: "0.75rem", opacity: 1 }}
				transition={{
					duration: 0.2,
				}}
				placeholder="Say something..."
				value={input}
				autoFocus
				rows={inputRows > 10 ? 10 : inputRows}
				onChange={handleInputChange}
				className="flex-1 w-full p-2 border border-transparent rounded dark:bg-neutral-600 focus:border-neutral-500 focus:outline-none"
			/>
			<button
				className="px-8 py-2 transition-colors rounded-lg bg-neutral-200 dark:bg-neutral-600 dark:border-neutral-400 hover:bg-neutral-300/75 dark:hover:bg-neutral-500"
				type="submit"
			>
				Send
			</button>
		</form>
	);
}
