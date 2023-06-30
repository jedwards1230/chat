"use client";

import { useConfig, useConfigDispatch } from "@/providers/ConfigProvider";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function Dialog({ children }: { children: React.ReactNode }) {
	const config = useConfig();
	const dispatch = useConfigDispatch();
	const ref = useRef<HTMLDivElement>(null);

	// click outside to close
	useEffect(() => {
		function handleClickOutside(event: any) {
			if (
				ref.current &&
				!ref.current.contains(event.target) &&
				config.agentEditorOpen
			) {
				dispatch({
					type: "TOGGLE_AGENT_EDITOR",
					payload: false,
				});
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [config, dispatch]);

	if (!config.agentEditorOpen) return null;
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
				className="w-full max-w-md p-4 border rounded-lg bg-neutral-50"
			>
				{children}
			</div>
		</motion.dialog>
	);
}
