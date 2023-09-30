'use client';

import { useMemo, useState } from 'react';
import { PrismAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Check } from '../../Icons';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';

export default function Markdown({
    content = '',
    children,
}: {
    content?: string;
    children?: string;
}) {
    const [btnClicked, setBtnClicked] = useState(false);

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
            p: ({ node, ...props }) => <div {...props} className="text-base" />,
            blockquote: ({ node, ...props }) => (
                <blockquote
                    {...props}
                    className="pl-4 border-l-4 border-blue-500"
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
                    return (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            alt={url}
                            src={url}
                            className="w-auto h-auto border border-gray-300 rounded-lg"
                            loading="lazy"
                        />
                    );
                }

                if (match) {
                    const Highlight = SyntaxHighlighter as any;
                    return (
                        <div className="flex flex-col gap-1 p-1 font-normal border rounded-rounded border-border bg-accent text-accent-foreground">
                            <div className="flex items-center justify-between">
                                <div className="pl-2">
                                    {language ? language : 'code'}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-accent-foreground"
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
                                    {btnClicked ? <Check /> : <Copy />}
                                </Button>
                            </div>
                            <Highlight
                                {...props}
                                style={vscDarkPlus}
                                className="!m-0"
                                language={match[1]}
                            >
                                {String(children)}
                            </Highlight>
                        </div>
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
                <ol {...props} className="list-decimal list-inside" />
            ),
            ul: ({ node, ...props }) => (
                <ul {...props} className="list-disc list-inside" />
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
            td: ({ node, ...props }) => (
                <td {...props} className="px-2 py-1 border border-gray-300" />
            ),
            th: ({ node, ...props }) => (
                <th {...props} className="px-2 py-1 border border-gray-300" />
            ),
            thead: ({ node, ...props }) => <thead {...props} />,
            tr: ({ node, ...props }) => <tr {...props} className="border" />,
        }),
        [btnClicked],
    );

    return (
        <ReactMarkdown
            className="flex flex-col w-full overflow-x-scroll overflow-y-hidden gap-y-4"
            remarkPlugins={[remarkGfm]}
            components={components}
        >
            {children || content}
        </ReactMarkdown>
    );
}
