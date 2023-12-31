'use client';

import * as React from 'react';
import { LucideLogIn, LucideLogOut, Moon, Settings, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUI } from '@/providers/UIProvider';
import { AUTH_ENABLED } from '@/appConfig';

export function AccountDropdown({
    children,
    user,
}: {
    children: React.ReactNode;
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}) {
    const [open, setOpen] = React.useState(false);
    const onSelect = (e: any) => {
        e.preventDefault();
        setOpen(false);
    };
    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghostAccent" className="w-full">
                    {children}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 p-1">
                <DropdownMenuItem onSelect={onSelect}>
                    <SettingsButton />
                </DropdownMenuItem>
                {AUTH_ENABLED && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            {user ? <LogOutButton /> : <LogInButton />}
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function ThemeToggle() {
    const { setTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2">
                    <Button size="icon-sm">
                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                    <span>Theme</span>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme('light')}>
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function LogOutButton() {
    return (
        <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-2"
        >
            <LucideLogOut />
            <span>Log Out</span>
        </button>
    );
}

export function LogInButton() {
    return (
        <Link
            href="/api/auth/signin"
            className="flex w-full items-center gap-2"
        >
            <LucideLogIn />
            <span>Log In</span>
        </Link>
    );
}

export function SettingsButton() {
    const { setAppSettingsOpen } = useUI();
    return (
        <button
            onClick={() => setAppSettingsOpen(true)}
            className="flex w-full items-center gap-2"
        >
            <Settings />
            <span>Config</span>
        </button>
    );
}
