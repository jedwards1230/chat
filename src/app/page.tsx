import { Chat, ChatHistory } from "../components";
import { ChatProvider } from "../providers/ChatProvider";

export default function Page() {
	return (
		<div className="flex w-full h-full">
			<ChatHistory />
			<Chat />
		</div>
	);
}
