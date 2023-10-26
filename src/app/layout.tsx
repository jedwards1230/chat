import PlausibleProvider from 'next-plausible';

import './globals.css';
import { metadataConfig, viewportConfig } from './metadata';
import Providers from '@/providers';

export const config = metadataConfig;
export const viewport = viewportConfig;

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning={true}>
            <head>
                <PlausibleProvider
                    domain="chat.jedwards.cc"
                    trackOutboundLinks={true}
                />
            </head>
            <body className="w-screen h-screen overflow-hidden transition-colors bg-background text-foreground">
                <Providers>
                    <div className="relative flex flex-col w-full h-full">
                        {children}
                    </div>
                </Providers>
            </body>
        </html>
    );
}
