import { SignIn } from "@clerk/nextjs";

export default function Page() {
	return (
		<div className="flex items-center justify-center w-full h-full">
			<SignIn />
		</div>
	);
}
