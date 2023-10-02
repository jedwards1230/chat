'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import clsx from 'clsx';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../../ui/dialog';
import { Label } from '../../ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../ui/select';
import DataSection from './DataSection';
import CredentialsSection from './CredentialsSection';
import { useUI } from '@/providers/UIProvider';
import { Button } from '@/components/ui/button';

export default function AppSettingsDialog() {
    const { appSettingsOpen, setAppSettingsOpen } = useUI();
    const { data: session } = useSession();
    const user = session?.user;

    const sections: AppSettingsSection[] = ['General', 'Credentials', 'Data'];
    const [activeSection, setActiveSection] =
        useState<AppSettingsSection>('General');
    useEffect(() => {
        if (typeof appSettingsOpen === 'string') {
            setActiveSection(appSettingsOpen);
            console.log('update');
        }
    }, [appSettingsOpen]);

    return (
        <Dialog
            defaultOpen={true}
            open={appSettingsOpen !== false}
            onOpenChange={setAppSettingsOpen}
        >
            <DialogContent className="max-w-3xl">
                <DialogTitle>App Settings</DialogTitle>

                <div className="flex flex-col justify-between gap-8 md:flex-row">
                    <div className="flex justify-center md:w-1/3 md:flex-col md:justify-start">
                        {sections.map((section) => (
                            <Button
                                variant="link"
                                key={section}
                                onClick={() => setActiveSection(section)}
                                className={clsx(
                                    'justify-start',
                                    activeSection === section &&
                                        'text-base font-bold',
                                )}
                            >
                                {section}
                            </Button>
                        ))}
                    </div>
                    <div className="flex flex-col w-full gap-4">
                        {activeSection === 'General' && <GeneralSection />}
                        {activeSection === 'Credentials' && (
                            <CredentialsSection user={user} />
                        )}
                        {activeSection === 'Data' && (
                            <DataSection user={user} />
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function GeneralSection() {
    const { setTheme, resolvedTheme } = useTheme();

    const theme = resolvedTheme
        ? resolvedTheme[0].toUpperCase() + resolvedTheme.slice(1)
        : '';

    return (
        <div>
            <DialogHeader>General</DialogHeader>
            <div className="flex items-center justify-between">
                <Label>Theme</Label>
                <Select onValueChange={(e) => setTheme(e)}>
                    <SelectTrigger
                        onChange={(e) => e.preventDefault()}
                        className="w-[180px]"
                    >
                        <SelectValue placeholder={theme} />
                    </SelectTrigger>
                    <SelectContent portal={false}>
                        <SelectGroup>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
