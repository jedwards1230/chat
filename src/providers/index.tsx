"use client";

import Dialogs from "@/components/Dialogs";
import { ChatProvider } from "./ChatProvider";
import { ConfigProvider } from "./ConfigProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ConfigProvider>
			<ChatProvider>
				{children}
				<Dialogs />
			</ChatProvider>
		</ConfigProvider>
	);
}
