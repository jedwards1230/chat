"use client";

import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";

import Dialogs from "@/components/Dialogs";
import { ChatProvider } from "./ChatProvider";
import { Session } from "next-auth";

export default function Providers({
	children,
	session,
}: {
	children: React.ReactNode;
	session: Session | null;
}) {
	return (
		<SessionProvider session={session}>
			<ThemeProvider>
				<ChatProvider session={session}>
					{children}
					<Dialogs />
				</ChatProvider>
			</ThemeProvider>
		</SessionProvider>
	);
}
