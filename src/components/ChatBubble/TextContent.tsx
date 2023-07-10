"use client";

import { SpecialComponents } from "react-markdown/lib/ast-to-react";
import { NormalComponents } from "react-markdown/lib/complex-types";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
	vs,
	vscDarkPlus,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import clsx from "clsx";
import { useMemo } from "react";

export default function TextContent({
	message,
	input,
	config,
}: {
	message: Message;
	input?: string;
	config: AgentConfig;
}) {
	const { resolvedTheme } = useTheme();
	const content =
		message.name && message.role !== "function"
			? `${message.name[0].toUpperCase() + message.name.substring(1)}: ${
					message.content
			  }`
			: message.content;

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
				const language = className?.replace("language-", "");
				const match = /language-(\w+)/.exec(className || "");
				return !inline && match ? (
					<div className="flex flex-col gap-1">
						<div className="border rounded-t-lg bg-neutral-200 dark:bg-neutral-700">
							<div className="px-2 pt-1 text-sm">
								{language ? language : "code"}
							</div>
							<SyntaxHighlighter
								{...props}
								style={
									resolvedTheme !== "dark" ? vs : vscDarkPlus
								}
								className="!mb-0"
								language={match[1]}
							>
								{String(children).replace(/\n$/, "")}
							</SyntaxHighlighter>
						</div>
						<div className="items-center justify-center hidden sm:flex">
							<button
								className="w-auto px-2 py-1 text-sm font-medium tracking-tight border rounded-full dark:bg-neutral-300 dark:text-neutral-900 active:bg-neutral-300 hover:bg-neutral-200 bg-neutral-50 border-neutral-500"
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
							"!w-full !overflow-x-scroll py-0.5 px-1 border border-neutral-500 rounded bg-neutral-100 tracking-wide transition-colors dark:bg-neutral-500"
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
				<li className="flex w-full" {...props}>
					<span className="list-marker">
						{ordered ? `${index + 1}.` : "-"}
					</span>
					<div className="">{children}</div>
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
		[resolvedTheme]
	);

	const FunctionContent = () => (
		<details className={"flex flex-col gap-2 items-start w-full rounded"}>
			<summary className="capitalize cursor-pointer">
				{message.name}: {input}
			</summary>
			<div>
				<ReactMarkdown
					className="flex flex-col w-full gap-1.5 rounded"
					remarkPlugins={[remarkGfm]}
					components={components}
				>
					{content}
				</ReactMarkdown>
			</div>
		</details>
	);

	const SystemContent = () => (
		<div className="flex flex-col justify-start w-full text-xs rounded text-neutral-400 dark:text-neutral-500">
			<div>Model: {config.model}</div>
			<div>System Message: {message.content}</div>
			{config.tools.length > 0 && (
				<div className="capitalize">
					Plugins: {config.tools.join(" | ")}
				</div>
			)}
		</div>
	);

	const TextContent = () => (
		<ReactMarkdown
			className="flex flex-col gap-1.5 rounded"
			remarkPlugins={[remarkGfm]}
			components={components}
		>
			{content}
		</ReactMarkdown>
	);

	return (
		<div className="flex flex-col justify-center w-full px-2 py-2 overflow-x-scroll transition-colors rounded lg:max-w-4xl">
			{message.role === "function" ? (
				<FunctionContent />
			) : message.role === "system" ? (
				<SystemContent />
			) : (
				<TextContent />
			)}
		</div>
	);
}
