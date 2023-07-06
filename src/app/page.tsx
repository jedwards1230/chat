import { Chat } from "../components";

export const runtime = "edge";

export default function Page() {
	return (
		<div className="relative flex w-full h-full">
			<Chat />
		</div>
	);
}
