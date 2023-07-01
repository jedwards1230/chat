export default function FunctionBubble({ message }: { message: Message }) {
	return (
		<div
			className={
				"flex flex-col transition-colors items-start hover:bg-neutral-200/20 dark:bg-neutral-700 justify-center py-1 px-2 m-1 border border-transparent dark:hover:border-neutral-600 hover:border-neutral-400/70 rounded"
			}
		>
			<div className="flex flex-col w-full gap-0 pl-2 overflow-x-scroll rounded">
				{message.role === "assistant" ? (
					<div>
						Using{" "}
						<span className="font-semibold capitalize">
							{message.function_call}
						</span>
						...
					</div>
				) : (
					<div>Result:</div>
				)}
				<div className="py-0 text-sm">{message.content}</div>
			</div>
		</div>
	);
}
