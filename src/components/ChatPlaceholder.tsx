import { Ellipsis } from './Icons';
import CharacterSelector from './Dialogs/CharacterSelector/CharacterSelector';

export default function ChatPlaceholder() {
    return (
        <div className="relative flex h-full w-full select-none flex-col items-center justify-start gap-8 overflow-hidden py-2 duration-300 animate-in fade-in-0 slide-in-from-bottom-8">
            <div className="absolute inset-x-auto inset-y-auto flex h-full max-w-4xl flex-col items-center justify-center gap-2">
                <div className="flex items-center gap-4 transition-all md:-mr-8">
                    <div className="text-center text-3xl font-medium sm:text-4xl">
                        Chat
                    </div>
                    <CharacterSelector>
                        <Ellipsis />
                    </CharacterSelector>
                </div>
            </div>
        </div>
    );
}
