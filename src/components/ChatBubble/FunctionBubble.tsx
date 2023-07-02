export default function FunctionBubble({ message }: { message: Message }) {
	return (
		<div className={"flex flex-col gap-2 items-start w-full rounded"}>
			<div>Result:</div>
			<div className="font-medium">{message.content}</div>
		</div>
	);
}
