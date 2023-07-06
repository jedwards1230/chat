import Link from "next/link";

export default function NotFound() {
	return (
		<div className="flex flex-col items-center justify-start w-full h-full gap-48 py-24">
			<h2 className="text-6xl font-medium">Not Found</h2>
			<p className="text-xl">
				Go{" "}
				<Link className="text-blue-500" href="/">
					Home
				</Link>
			</p>
		</div>
	);
}
