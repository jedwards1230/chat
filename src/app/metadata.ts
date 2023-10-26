import { Metadata, Viewport } from 'next';

const APP_NAME = 'Chat';
const APP_DEFAULT_TITLE = 'Chat';
const APP_TITLE_TEMPLATE = 'Chat | %s';
const APP_DESCRIPTION = 'Chat';

export const metadataConfig: Metadata = {
    metadataBase: new URL(
        process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
    ),
    applicationName: APP_NAME,
    title: {
        default: APP_DEFAULT_TITLE,
        template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: APP_DEFAULT_TITLE,
        // startUpImage: [],
    },
    formatDetection: {
        telephone: false,
    },
    openGraph: {
        url: '/api/og',
        images: ['/api/og'],
        type: 'website',
        siteName: APP_NAME,
        title: {
            default: APP_DEFAULT_TITLE,
            template: APP_TITLE_TEMPLATE,
        },
        description: APP_DESCRIPTION,
    },
    twitter: {
        card: 'summary',
        title: {
            default: APP_DEFAULT_TITLE,
            template: APP_TITLE_TEMPLATE,
        },
        description: APP_DESCRIPTION,
    },
};

export const viewportConfig: Viewport = {
    themeColor: '#262626',
};
