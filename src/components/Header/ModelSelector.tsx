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
import { modelMap } from '@/utils/model';

export default function ModelSelector() {
    const { activeThread, updateThreadConfig } = useChat();
    const activeModel = activeThread.agentConfig.model;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">Model: {activeModel.name}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 p-1">
                <DropdownMenuRadioGroup>
                    <DropdownMenuLabel>OpenAI</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {modelMap.openai.map((model) => (
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
                    {modelMap.llama.map((model) => (
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
