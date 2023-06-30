"use client";

import { useChatCtx } from "@/providers/ChatProvider";

export default function ChatInput() {
	const { input, handleSubmit, handleInputChange } = useChatCtx();

	return (
		<form
			onSubmit={handleSubmit}
			className="flex items-center justify-center w-full gap-2 px-4 pt-2 pb-3 border-t shadow-xl dark:shadow-none border-neutral-300 dark:border-neutral-600 dark:border-0 justify-self-end "
		>
			<input
				placeholder="Say something..."
				value={input}
				autoFocus
				onChange={handleInputChange}
				className="flex-1 w-full p-2 border border-transparent rounded dark:bg-neutral-600 focus:border-neutral-500 focus:outline-none"
			/>
			<button
				className="px-8 py-2 transition-colors border rounded-lg bg-neutral-200 dark:border-neutral-500 hover:bg-neutral-300/75 dark:hover:bg-neutral-700"
				type="submit"
			>
				Send
			</button>
		</form>
	);
}
