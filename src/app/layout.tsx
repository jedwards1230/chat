import { Suspense } from "react";
import "./globals.css";
import Providers from "@/providers";
import { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const APP_NAME = "Chat";
const APP_DEFAULT_TITLE = "Chat";
const APP_TITLE_TEMPLATE = "Chat - %s";
const APP_DESCRIPTION = "Chat";

export const metadata: Metadata = {
	metadataBase: new URL("http://localhost:3000"),
	applicationName: APP_NAME,
	title: {
		default: APP_DEFAULT_TITLE,
		template: APP_TITLE_TEMPLATE,
	},
	description: APP_DESCRIPTION,
	manifest: "/manifest.json",
	themeColor: "#262626",
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: APP_DEFAULT_TITLE,
		// startUpImage: [],
	},
	formatDetection: {
		telephone: false,
	},
	openGraph: {
		type: "website",
		siteName: APP_NAME,
		title: {
			default: APP_DEFAULT_TITLE,
			template: APP_TITLE_TEMPLATE,
		},
		description: APP_DESCRIPTION,
	},
	twitter: {
		card: "summary",
		title: {
			default: APP_DEFAULT_TITLE,
			template: APP_TITLE_TEMPLATE,
		},
		description: APP_DESCRIPTION,
	},
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getServerSession(authOptions);
	return (
		<html lang="en" suppressHydrationWarning={true}>
			<body className="overflow-hidden bg-neutral-50 dark:text-neutral-100 dark:bg-neutral-900">
				<Suspense
					fallback={
						<div className="flex items-center justify-center w-full h-full">
							<p>Loading...</p>
						</div>
					}
				>
					<Providers session={session}>{children}</Providers>
				</Suspense>
			</body>
		</html>
	);
}
