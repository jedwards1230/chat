import { Chat, ChatHistory } from "../components";
import { ChatProvider } from "./context";

export default function Page() {
	return (
		<div className="flex w-full h-full">
			<ChatProvider>
				<ChatHistory />
				<Chat />
			</ChatProvider>
		</div>
	);
}
