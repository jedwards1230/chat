import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/utils';

const buttonVariants = cva(
    'inline-flex items-center text-ellipsis justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                default:
                    'bg-primary text-primary-foreground hover:bg-primary/70',
                destructive:
                    'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                primaryBlue:
                    'bg-blue-primary text-background dark:text-foreground hover:bg-blue-primary/80',
                primaryGreen:
                    'bg-green-primary text-background dark:text-foreground hover:bg-green-primary/80',
                outline:
                    'border border-input bg-background hover:bg-accent hover:dark:bg-background/80 hover:text-accent-foreground',
                outlineAccent:
                    'border border-input text-accent-foreground bg-accent hover:bg-background/30 hover:dark:bg-background/80 hover:dark:text-foreground',
                outlineDestructive:
                    'border border text-foreground border-destructive hover:bg-destructive hover:text-destructive-foreground',
                secondary:
                    'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                ghost: 'hover:bg-accent hover:text-accent-foreground',
                ghostAccent:
                    'hover:bg-background/40 dark:hover:bg-background/80',
                link: 'text-primary underline-offset-4 hover:underline',
                functionPreview:
                    'dark:bg-primary border-2 border-border text-foreground dark:text-primary-foreground hover:dark:bg-primary/70 hover:bg-primary/20',
                functionPreviewLoading:
                    'bg-primary text-primary-foreground border-2 cursor-default border-blue-primary border-pulse opacity-100',
            },
            size: {
                default: 'h-10 px-4 py-2',
                xs: 'h-7 px-2 py-3',
                sm: 'h-9 rounded-md px-3',
                lg: 'h-11 rounded-md px-8',
                icon: 'h-10 w-10',
                'icon-sm': 'h-6 w-6',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
