'use client';

import * as React from 'react';
import { Key, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import clsx from 'clsx';
import { useSession } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUI } from '@/providers/UIProvider';
import { isMobile } from '@/utils/client/device';
import { Person, Settings } from '../Icons';
import { useChat } from '@/providers/ChatProvider';

export function ThemeToggle() {
    const { setTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="icon">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
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

export function ApiButton() {
    const { data: session } = useSession();
    const userId = session?.user?.email;
    const { openAiApiKey } = useChat();
    const { setSideBarOpen, setOpenAIKeyOpen } = useUI();

    const openAIOpen = () => {
        setOpenAIKeyOpen(true);
        if (isMobile()) setSideBarOpen(false);
    };

    return (
        <Button
            size="icon"
            title={
                userId
                    ? 'Using Cloud Key (currently set by EnvVar. Ignoring Local Key)'
                    : openAiApiKey
                    ? 'Using Local Key'
                    : 'Invalid OpenAI API Key'
            }
            onClick={openAIOpen}
            className={clsx(
                userId
                    ? 'text-green-600'
                    : openAiApiKey
                    ? 'text-neutral-300'
                    : 'text-red-600',
            )}
        >
            {userId ? <Person /> : <Key />}
        </Button>
    );
}

export function SettingsButton() {
    const { setSideBarOpen, setConfigEditorOpen } = useUI();

    const openConfig = (e: any) => {
        setConfigEditorOpen(true);
        if (isMobile()) setSideBarOpen(false);
    };

    return (
        <Button size="icon" name="config-editor-toggle" onClick={openConfig}>
            <Settings />
        </Button>
    );
}
