import resolveConfig from 'tailwindcss/resolveConfig';

import tailwindConfig from '../../../tailwind.config.js';

export const fullConfig = resolveConfig(tailwindConfig);

export function isMobile(size?: 'sm' | 'md' | 'lg' | 'xl') {
    if (typeof window === 'undefined') return false;
    const screens = fullConfig.theme?.screens as Record<string, string>;
    switch (size) {
        case 'sm':
            return window.innerWidth < parseInt(screens.sm);
        case 'md':
            return window.innerWidth < parseInt(screens.md);
        case 'lg':
            return window.innerWidth < parseInt(screens.lg);
        case 'xl':
            return window.innerWidth < parseInt(screens.xl);
        default:
            return window.innerWidth < parseInt(screens.sm);
    }
}
