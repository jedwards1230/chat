"use client";

import { ChatProvider } from "./ChatProvider";
import { ConfigProvider } from "./ConfigProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ConfigProvider>
			<ChatProvider>{children}</ChatProvider>
		</ConfigProvider>
	);
}
