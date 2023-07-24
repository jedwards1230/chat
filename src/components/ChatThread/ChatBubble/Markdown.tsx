'use client';

import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { SpecialComponents } from 'react-markdown/lib/ast-to-react';
import { NormalComponents } from 'react-markdown/lib/complex-types';
import { PrismAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check } from '../../Icons';

export default function Markdown({
    content = '',
    children,
}: {
    content?: string;
    children?: string;
}) {
    const { resolvedTheme } = useTheme();
    const [btnClicked, setBtnClicked] = useState(false);

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
                    className="border-l-4 border-blue-500 pl-4"
                />
            ),
            br: ({ node, ...props }) => <br {...props} className="my-1" />,
            pre: ({ node, ...props }) => <pre {...props} className="" />,
            code({ node, inline, className, children, ...props }) {
                const language = className?.replace('language-', '');
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                    <div className="flex flex-col gap-2">
                        <div className="rounded-t-lg border border-neutral-600 bg-neutral-200 dark:bg-neutral-700">
                            <div className="pb-1 pl-4 pt-2 text-sm">
                                {language ? language : 'code'}
                            </div>
                            <SyntaxHighlighter
                                {...props}
                                style={
                                    resolvedTheme !== 'dark' ? vs : vscDarkPlus
                                }
                                className="!mb-0"
                                language={match[1]}
                            >
                                {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                        </div>
                        <div className="flex items-center justify-center">
                            <button
                                className={clsx(
                                    btnClicked
                                        ? 'border-neutral-400 bg-neutral-50 text-green-500 hover:bg-neutral-100 dark:bg-neutral-500 dark:hover:bg-neutral-500'
                                        : 'border-neutral-500 bg-neutral-50 hover:bg-neutral-200 dark:bg-neutral-300 dark:text-neutral-900',
                                    'flex h-8 w-20 justify-center rounded-full border px-2 py-1 text-sm font-medium tracking-tight active:bg-neutral-300 dark:active:bg-neutral-400',
                                )}
                                onClick={() => {
                                    navigator.clipboard.writeText(
                                        String(children),
                                    );
                                    setBtnClicked(true);
                                    setTimeout(() => {
                                        setBtnClicked(false);
                                    }, 1000);
                                }}
                            >
                                {btnClicked ? <Check /> : 'Copy'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        {...props}
                        className={clsx(
                            className,
                            'inline-block rounded border border-neutral-500 bg-neutral-100 px-1 tracking-wide transition-colors dark:bg-neutral-600',
                        )}
                    >
                        <code className="whitespace-pre-wrap">{children}</code>
                    </div>
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
                        {ordered ? `${index + 1}.` : '-'}
                    </span>
                    <div className="">{children}</div>
                </li>
            ),
            ol: ({ node, depth, ordered, ...props }) => (
                <ol
                    {...props}
                    className="inline-block list-outside list-decimal"
                />
            ),
            ul: ({ node, depth, ordered, ...props }) => (
                <ul
                    {...props}
                    className="inline-block list-outside list-disc"
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
                    className="border-collapse border border-gray-300"
                />
            ),
            tbody: ({ node, ...props }) => <tbody {...props} />,
            td: ({ node, isHeader, ...props }) => (
                <td {...props} className="border border-gray-300 px-2 py-1" />
            ),
            th: ({ node, isHeader, ...props }) => (
                <th {...props} className="border border-gray-300 px-2 py-1" />
            ),
            thead: ({ node, ...props }) => <thead {...props} />,
            tr: ({ node, isHeader, ...props }) => (
                <tr {...props} className="border" />
            ),
        }),
        [btnClicked, resolvedTheme],
    );

    return (
        <ReactMarkdown
            className="flex w-full flex-col gap-y-4 overflow-x-scroll"
            linkTarget="_blank"
            remarkPlugins={[remarkGfm]}
            components={components}
        >
            {children || content}
        </ReactMarkdown>
    );
}
