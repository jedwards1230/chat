"use client";

import { ThemeProvider } from "next-themes";

import Dialogs from "@/components/Dialogs";
import { ChatProvider } from "./ChatProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider>
			<ChatProvider>
				{children}
				<Dialogs />
			</ChatProvider>
		</ThemeProvider>
	);
}
