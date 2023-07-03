"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useChat, useChatDispatch } from "@/providers/ChatProvider";

export default function Dialog({
	children,
	callback,
}: {
	children: React.ReactNode;
	callback: () => void;
}) {
	const config = useChat();
	const dispatch = useChatDispatch();
	const ref = useRef<HTMLDivElement>(null);

	// click outside to close
	useEffect(() => {
		function handleClickOutside(event: any) {
			if (ref.current && !ref.current.contains(event.target)) {
				callback();
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [callback, config, dispatch]);

	return (
		<motion.dialog
			initial={{
				opacity: 0,
			}}
			animate={{
				opacity: 1,
			}}
			className="fixed top-0 right-0 z-50 flex items-center justify-center w-full h-full bg-neutral-900/50"
		>
			<div
				ref={ref}
				className="w-full max-w-md p-4 border rounded-lg sm:px-6 bg-neutral-50 dark:bg-neutral-800 dark:border-neutral-500"
			>
				{children}
			</div>
		</motion.dialog>
	);
}
