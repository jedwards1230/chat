export default function FunctionBubble({ message }: { message: Message }) {
	return (
		<div className={"flex gap-2 items-center w-full rounded pl-2"}>
			{message.role === "assistant" ? (
				<div>
					Using{" "}
					<span className="font-semibold capitalize">
						{message.function_call?.name}
					</span>
					...
				</div>
			) : (
				<div>Result:</div>
			)}
			<div className="font-medium">{message.content}</div>
		</div>
	);
}
