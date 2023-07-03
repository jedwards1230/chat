"use client";

import Dialog from "./Dialog";
import { useChatDispatch } from "@/providers/ChatProvider";
import { signIn } from "next-auth/react";

export default function SignIn() {
	const dispatch = useChatDispatch();

	return (
		<Dialog
			required={true}
			callback={() =>
				dispatch({
					type: "TOGGLE_SIGN_IN",
					payload: false,
				})
			}
		>
			<div className="w-full pb-4 text-xl font-semibold text-center">
				Sign In
			</div>

			<button onClick={() => signIn("github")}>
				Sign in with GitHub
			</button>
		</Dialog>
	);
}
