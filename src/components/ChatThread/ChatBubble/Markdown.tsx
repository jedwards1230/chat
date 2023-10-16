'use client';

import clsx from 'clsx';
import remarkGfm from 'remark-gfm';
import { useMemo, memo } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';

import CodeBlock from '../CodeBlock';

function Markdown({
    content = '',
    children,
    className,
}: {
    content?: string;
    children?: string;
    className?: string;
}) {
    const components = useMemo<Partial<Components>>(
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
            p: ({ node, ...props }) => (
                <span {...props} className="text-base" />
            ),
            blockquote: ({ node, ...props }) => (
                <blockquote
                    {...props}
                    className="border-l-4 border-blue-500 pl-4"
                />
            ),
            br: ({ node, ...props }) => <br {...props} className="my-1" />,
            code({ node, className, children, ...props }) {
                const language = className?.replace('language-', '');
                const match = /language-(\w+)/.exec(className || '');

                const value = (node?.children[0] as any).value;
                const isImg = value.startsWith('![');

                if (isImg) {
                    const url = value.match(/\(([^)]+)\)/)[1];
                    const verifiedUrl = new URL(url);
                    if (verifiedUrl) {
                        return (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                alt={verifiedUrl.pathname}
                                src={verifiedUrl.href}
                                className="h-auto w-auto rounded-lg border border-gray-300"
                                loading="lazy"
                            />
                        );
                    }
                }

                if (match) {
                    return (
                        <CodeBlock
                            language={language}
                            value={String(children)}
                            {...props}
                        />
                    );
                }

                return (
                    <code className="whitespace-pre-wrap bg-secondary px-0.5 font-bold tracking-widest">
                        {children}
                    </code>
                );
            },
            em: ({ node, ...props }) => <em {...props} className="italic" />,
            strong: ({ node, ...props }) => (
                <strong {...props} className="font-bold" />
            ),
            hr: ({ node, ...props }) => <hr {...props} className="my-2" />,
            ol: ({ node, ...props }) => (
                <ol {...props} className="list-inside list-decimal pl-4" />
            ),
            ul: ({ node, ...props }) => (
                <ul {...props} className="list-inside list-disc pl-4" />
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
            td: ({ node, ...props }) => (
                <td {...props} className="border border-gray-300 px-2 py-1" />
            ),
            th: ({ node, ...props }) => (
                <th {...props} className="border border-gray-300 px-2 py-1" />
            ),
            thead: ({ node, ...props }) => <thead {...props} />,
            tr: ({ node, ...props }) => <tr {...props} className="border" />,
        }),
        [],
    );

    return (
        <ReactMarkdown
            className={clsx('space-y-4', className)}
            remarkPlugins={[remarkGfm]}
            components={components}
        >
            {children || content}
        </ReactMarkdown>
    );
}

export default memo(Markdown);
