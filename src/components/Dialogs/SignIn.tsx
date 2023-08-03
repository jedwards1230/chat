import { SignIn as ClerkComponent, useAuth } from '@clerk/nextjs';

import Dialog from './Dialog';
import { useUI } from '@/providers/UIProvider';

export default function SignIn() {
    const { setSignInOpen } = useUI();
    const closeConfigEditor = () => {
        setSignInOpen(false);
    };
    return (
        <Dialog hideCard={true} callback={closeConfigEditor}>
            <ClerkComponent path="/" signUpUrl="/sign-up" />
        </Dialog>
    );
}
