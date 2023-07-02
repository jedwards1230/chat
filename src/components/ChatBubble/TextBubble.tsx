"use client";

import { SpecialComponents } from "react-markdown/lib/ast-to-react";
import { NormalComponents } from "react-markdown/lib/complex-types";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
	vs,
	vscDarkPlus,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import clsx from "clsx";
import { useMemo } from "react";

export default function TextBubble({ message }: { message: Message }) {
	const components = useMemo<
		Partial<
			Omit<NormalComponents, keyof SpecialComponents> & SpecialComponents
		>
	>(
		() => ({
			h1: ({ node, ...props }) => (
				<h1 {...props} className="text-2xl font-bold" />
			),
			h2: ({ node, ...props }) => (
				<h2 {...props} className="text-xl font-bold" />
			),
			h3: ({ node, ...props }) => (
				<h3 {...props} className="text-lg font-bold" />
			),
			h4: ({ node, ...props }) => (
				<h4 {...props} className="text-base font-bold" />
			),
			h5: ({ node, ...props }) => (
				<h5 {...props} className="text-sm font-bold" />
			),
			h6: ({ node, ...props }) => (
				<h6 {...props} className="text-xs font-bold" />
			),
			p: ({ node, ...props }) => <div {...props} className="text-base" />,
			blockquote: ({ node, ...props }) => (
				<blockquote
					{...props}
					className="pl-4 border-l-4 border-blue-500"
				/>
			),
			br: ({ node, ...props }) => <br {...props} className="my-1" />,
			pre: ({ node, ...props }) => <pre {...props} className="" />,
			code({ node, inline, className, children, ...props }) {
				const match = /language-(\w+)/.exec(className || "");
				return !inline && match ? (
					<div className="flex flex-col flex-grow-0 gap-0">
						<SyntaxHighlighter
							{...props}
							//style={resolvedTheme !== "dark" ? vs : vscDarkPlus}
							style={vs}
							language={match[1]}
							className="!w-full !overflow-x-scroll !mb-1"
						>
							{String(children).replace(/\n$/, "")}
						</SyntaxHighlighter>
						<div className="flex items-center justify-center">
							<button
								className="w-auto px-2 py-1 text-sm font-medium tracking-tight border rounded-full dark:bg-neutral-400 dark:text-neutral-900 active:bg-neutral-300 hover:bg-neutral-200 bg-neutral-50 border-neutral-500"
								onClick={() => {
									navigator.clipboard.writeText(
										String(children)
									);
								}}
							>
								Copy Code
							</button>
						</div>
					</div>
				) : (
					<code
						{...props}
						className={clsx(
							className,
							"!w-full !overflow-x-scroll p-1 border border-neutral-500 rounded bg-neutral-100 tracking-wide transition-colors dark:bg-neutral-500"
						)}
					>
						{children}
					</code>
				);
			},
			em: ({ node, ...props }) => <em {...props} className="italic" />,
			strong: ({ node, ...props }) => (
				<strong {...props} className="font-bold" />
			),
			hr: ({ node, ...props }) => <hr {...props} className="my-2" />,
			li: ({ node, index, ordered, checked, children, ...props }) => (
				<li className="flex ml-4" {...props}>
					<span className="list-marker">
						{ordered ? `${index + 1}.` : "-"}
					</span>
					{children}
				</li>
			),
			ol: ({ node, depth, ordered, ...props }) => (
				<ol
					{...props}
					className="inline-block list-decimal list-outside"
				/>
			),
			ul: ({ node, depth, ordered, ...props }) => (
				<ul
					{...props}
					className="inline-block list-disc list-outside"
				/>
			),
			a: ({ node, ...props }) => (
				<a {...props} className="text-blue-500 hover:underline" />
			),
			del: ({ node, ...props }) => (
				<del {...props} className="line-through" />
			),
			input: ({ node, ...props }) => (
				<input {...props} className="rounded bg-gray-100 px-1 py-0.5" />
			),
			table: ({ node, ...props }) => (
				<table
					{...props}
					className="border border-collapse border-gray-300"
				/>
			),
			tbody: ({ node, ...props }) => <tbody {...props} />,
			td: ({ node, isHeader, ...props }) => (
				<td {...props} className="px-2 py-1 border border-gray-300" />
			),
			th: ({ node, isHeader, ...props }) => (
				<th {...props} className="px-2 py-1 border border-gray-300" />
			),
			thead: ({ node, ...props }) => <thead {...props} />,
			tr: ({ node, isHeader, ...props }) => (
				<tr {...props} className="border" />
			),
		}),
		[]
	);

	let content: string = message.content;
	if (message.name && message.role !== "function") {
		const tool = message.name[0].toUpperCase() + message.name.substring(1);
		content = `${tool}: ${content}`;
	}

	return (
		<div
			className={clsx(
				"flex transition-colors items-start justify-center max-w-full overflow-x-scroll py-2 px-2 rounded",
				message.role === "user" ? "bg-blue-100 dark:bg-blue-600/70" : ""
			)}
		>
			{message.role === "function" ? (
				<details
					className={"flex flex-col gap-2 items-start w-full rounded"}
				>
					<summary className="capitalize cursor-pointer">
						{message.name} Result
					</summary>
					<div>
						<ReactMarkdown
							className="flex flex-col whitespace-pre-wrap w-full gap-1.5 rounded"
							remarkPlugins={[remarkGfm]}
							components={components}
						>
							{content}
						</ReactMarkdown>
					</div>
				</details>
			) : (
				<ReactMarkdown
					className="whitespace-pre-wrap w-full gap-1.5 rounded"
					remarkPlugins={[remarkGfm]}
					components={components}
				>
					{content}
				</ReactMarkdown>
			)}
		</div>
	);
}
