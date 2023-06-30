"use client";

import ChatBubble from "./ChatBubble";
import { useChatCtx } from "../providers/ChatProvider";

export default function Chat() {
	const { input, handleSubmit, handleInputChange, activeThread } =
		useChatCtx();

	return (
		<div className="flex flex-col w-full h-full">
			<div className="flex items-center justify-center px-2 py-4 border-b shadow border-neutral-300 dark:bg-neutral-900/75 dark:border-neutral-500 bg-neutral-50">
				<p>{activeThread.title}</p>
			</div>
			<div className="flex-1 p-2 overflow-scroll">
				{activeThread.messages.map((m) => (
					<ChatBubble key={m.id} role={m.role} content={m.content} />
				))}
			</div>
			<form
				onSubmit={handleSubmit}
				className="flex items-center justify-center w-full gap-2 px-4 pt-2 pb-3 border-t shadow-xl dark:shadow-none border-neutral-300 dark:border-neutral-600 dark:border-0 justify-self-end "
			>
				<input
					placeholder="Say something..."
					value={input}
					autoFocus
					onChange={handleInputChange}
					className="flex-1 w-full p-2 rounded dark:bg-neutral-600 focus:outline-none"
				/>
				<button
					className="px-8 py-2 border rounded-lg dark:border-neutral-500 hover:bg-neutral-300/75 dark:hover:bg-neutral-700"
					type="submit"
				>
					Send
				</button>
			</form>
		</div>
	);
}
