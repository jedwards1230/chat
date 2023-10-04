import React, {
    Dispatch,
    SetStateAction,
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';

import { isMobile as iM } from '@/utils/client/device';

type ModalState = {
    sideBarOpen: boolean;
    setSideBarOpen: (open: boolean) => void;
    chatSettingsOpen: boolean;
    setChatSettingsOpen: (open: boolean) => void;
    shareModalOpen: boolean;
    setShareModalOpen: (open: boolean) => void;
    appSettingsOpen: boolean | AppSettingsSection;
    setAppSettingsOpen: (open: boolean | AppSettingsSection) => void;
    signInOpen: boolean;
    setSignInOpen: Dispatch<SetStateAction<boolean>>;
};

const initState: ModalState = {
    sideBarOpen: true,
    setSideBarOpen: () => {},
    chatSettingsOpen: false,
    setChatSettingsOpen: () => {},
    shareModalOpen: false,
    setShareModalOpen: () => {},
    appSettingsOpen: false,
    setAppSettingsOpen: () => {},
    signInOpen: false,
    setSignInOpen: () => {},
};

const UIContext = createContext<ModalState>(initState);

export const useUI = () => useContext(UIContext);

export function UIProvider({ children }: { children: React.ReactNode }) {
    const [isMobile, setIsMobile] = useState(iM('md') || false);
    const [sideBarOpen, setSideBarOpen] = useState(initState.sideBarOpen);
    const [chatSettingsOpen, setChatSettingsOpen] = useState(
        initState.chatSettingsOpen,
    );
    const [shareModalOpen, setShareModalOpen] = useState(
        initState.shareModalOpen,
    );
    const [signInOpen, setSignInOpen] = useState(initState.signInOpen);
    const [appSettingsOpen, setAppSettingsOpen] = useState(
        initState.appSettingsOpen,
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
                shareModalOpen,
                setShareModalOpen,
                signInOpen,
                setSignInOpen,
                appSettingsOpen,
                setAppSettingsOpen,
            }}
        >
            {children}
        </UIContext.Provider>
    );
}
