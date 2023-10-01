'use client';

import { Copy } from 'lucide-react';
import { useState } from 'react';
import { PrismAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { Check } from '../Icons';
import { Button } from '@/components/ui/button';

export default function CodeBlock({
    language,
    value,
    ...props
}: {
    language?: string;
    value: string;
}) {
    const [btnClicked, setBtnClicked] = useState(false);

    const Highlight = SyntaxHighlighter as any;
    return (
        <div className="rounded-rounded flex flex-col gap-1 border border-border bg-accent font-normal text-accent-foreground">
            <div className="flex items-center justify-between px-4 py-2">
                <div>{language ? language : 'code'}</div>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="pt-0.5 text-accent-foreground"
                    onClick={() => {
                        navigator.clipboard.writeText(value);
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
                language={language}
            >
                {value}
            </Highlight>
        </div>
    );
}
