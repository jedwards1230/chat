import { Suspense } from "react";
import "./globals.css";

export const metadata = {
	title: "Create Next App",
	description: "Generated by create next app",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className="bg-neutral-100 dark:text-neutral-100 dark:bg-neutral-800">
				<Suspense>{children}</Suspense>
			</body>
		</html>
	);
}
