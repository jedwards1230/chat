import { Suspense } from "react";
import "./globals.css";
import Providers from "@/providers";
import { Metadata } from "next";
import { ClerkProvider, auth } from "@clerk/nextjs";

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

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { userId } = auth();

	return (
		<ClerkProvider>
			<html
				lang="en"
				className="overflow-hidden"
				suppressHydrationWarning={true}
			>
				<body className="overflow-hidden bg-neutral-50 dark:text-neutral-100 dark:bg-neutral-900">
					<Suspense
						fallback={
							<div className="flex items-center justify-center w-full h-full">
								<p>Loading...</p>
							</div>
						}
					>
						<Providers userId={userId}>{children}</Providers>
					</Suspense>
				</body>
			</html>
		</ClerkProvider>
	);
}
