"use client";

import { ThemeProvider } from "next-themes";

import Dialogs from "@/components/Dialogs";
import { ChatProvider } from "./ChatProvider";

export default function Providers({
	children,
	userId,
}: {
	children: React.ReactNode;
	userId: string | null;
}) {
	return (
		<ThemeProvider>
			<ChatProvider userId={userId}>
				{children}
				<Dialogs />
			</ChatProvider>
		</ThemeProvider>
	);
}
