import { createContext, useContext, useEffect, useState } from 'react';

import { isMobile as iM } from '@/utils/client';

type ModalState = {
    sideBarOpen: boolean;
    setSideBarOpen: (open: boolean) => void;
    chatSettingsOpen: boolean;
    setChatSettingsOpen: (open: boolean) => void;
    configEditorOpen: boolean;
    setConfigEditorOpen: (open: boolean) => void;
    shareModalOpen: boolean;
    setShareModalOpen: (open: boolean) => void;
    personalitySelectorOpen: boolean;
    setPersonalitySelectorOpen: (open: boolean) => void;
};

const initialState: ModalState = {
    sideBarOpen: true,
    setSideBarOpen: () => {},
    chatSettingsOpen: false,
    setChatSettingsOpen: () => {},
    configEditorOpen: false,
    setConfigEditorOpen: () => {},
    shareModalOpen: false,
    setShareModalOpen: () => {},
    personalitySelectorOpen: false,
    setPersonalitySelectorOpen: () => {},
};

const UIContext = createContext<ModalState>(initialState);

export const useUI = () => useContext(UIContext);

export function UIProvider({ children }: { children: React.ReactNode }) {
    const [isMobile, setIsMobile] = useState(iM('md') || false);
    const [sideBarOpen, setSideBarOpen] = useState(initialState.sideBarOpen);
    const [chatSettingsOpen, setChatSettingsOpen] = useState(
        initialState.chatSettingsOpen,
    );
    const [configEditorOpen, setConfigEditorOpen] = useState(
        initialState.configEditorOpen,
    );
    const [shareModalOpen, setShareModalOpen] = useState(
        initialState.shareModalOpen,
    );
    const [personalitySelectorOpen, setPersonalitySelectorOpen] = useState(
        initialState.personalitySelectorOpen,
    );

    const handleResize = () => {
        if (isMobile && !iM('md')) {
            setSideBarOpen(false);
            setIsMobile(true);
        } else if (!iM('md')) {
            setSideBarOpen(true);
            setIsMobile(false);
        } else {
            setSideBarOpen(false);
        }
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <UIContext.Provider
            value={{
                sideBarOpen,
                setSideBarOpen,
                chatSettingsOpen,
                setChatSettingsOpen,
                configEditorOpen,
                setConfigEditorOpen,
                shareModalOpen,
                setShareModalOpen,
                personalitySelectorOpen,
                setPersonalitySelectorOpen,
            }}
        >
            {children}
        </UIContext.Provider>
    );
}
