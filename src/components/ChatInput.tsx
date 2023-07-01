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
			className="flex items-center justify-center w-full gap-2 px-4 pt-2 pb-8 border-t shadow-xl sm:pb-4 dark:shadow-none border-neutral-300 dark:border-neutral-600 dark:border-0 justify-self-end "
		>
			<motion.textarea
				placeholder="Say something..."
				value={input}
				autoFocus
				rows={inputRows > 10 ? 10 : inputRows}
				onChange={handleInputChange}
				onKeyDown={onKeyDownHandler}
				className="flex-1 w-full p-2 focus:border-blue-500 border-2 border-transparent rounded dark:bg-neutral-600  focus:outline-none"
			/>
			{input && (
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
