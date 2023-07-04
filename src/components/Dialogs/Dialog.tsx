"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";

export default function Dialog({
	children,
	className,
	callback,
}: {
	children: React.ReactNode;
	className?: string;
	callback: () => void;
}) {
	const ref = useRef<HTMLDivElement>(null);

	// click outside to close
	useEffect(() => {
		function handleClickOutside(event: any) {
			if (ref.current && !ref.current.contains(event.target)) {
				callback();
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("touchstart", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("touchstart", handleClickOutside);
		};
	}, [callback]);

	return (
		<dialog className="fixed top-0 right-0 z-50 flex items-center justify-center w-full h-full bg-neutral-900/50">
			<div
				ref={ref}
				className={clsx(
					"w-full max-w-md p-4 border rounded-lg sm:px-6 bg-neutral-50 dark:bg-neutral-800 transition-all dark:border-neutral-500",
					className
				)}
			>
				{children}
			</div>
		</dialog>
	);
}
