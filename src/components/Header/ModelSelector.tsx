'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useChat } from '@/providers/ChatProvider';
import { Button } from '../ui/button';
import { getListByApi } from '@/providers/models';

export default function ModelSelector() {
    const { activeThread, defaultThread, updateThreadConfig } = useChat();
    const thread: ChatThread | undefined = activeThread || defaultThread;
    const activeModel = thread.agentConfig.model;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outlineAccent">
                    Model: {activeModel.name}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 p-1">
                <DropdownMenuRadioGroup>
                    <DropdownMenuLabel>OpenAI</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {getListByApi('openai').map((model) => (
                        <DropdownMenuRadioItem
                            key={model.api + model.name}
                            value={model.name}
                            onClick={() => updateThreadConfig({ model })}
                        >
                            {model.name}
                        </DropdownMenuRadioItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Llama</DropdownMenuLabel>
                    {getListByApi('llama').map((model) => (
                        <DropdownMenuRadioItem
                            key={model.api + model.name}
                            value={model.name}
                            onClick={() => updateThreadConfig({ model })}
                        >
                            {model.name}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
