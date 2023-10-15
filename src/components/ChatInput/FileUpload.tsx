import { ChangeEvent } from 'react';

import { useChat } from '@/providers/ChatProvider';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { createMessage } from '@/utils/client/chat';

export default function FileUpload({ thread }: { thread: ChatThread }) {
    const { addMessage } = useChat();

    const onFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            for (const file of files) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const contents = e.target?.result;
                    if (contents) {
                        const content =
                            typeof contents === 'string'
                                ? contents
                                : contents.toString();

                        const fileExtension =
                            file.name.split('.').pop() || 'txt';

                        const message = createMessage({
                            role: 'user',
                            name: file.name,
                            content: `\`\`\`${fileExtension}\n// ${file.name}\n\n${content}\n\`\`\``,
                        });

                        addMessage(message, thread);
                    }
                };
                reader.onerror = (e) => {
                    console.log('Failed to read file', file.type);
                };
                reader.readAsText(file);
            }
        }
    };

    return (
        <>
            <Button
                className="text-xl font-bold"
                variant="outline"
                size="icon"
                onClick={() => document.getElementById('fileInput')?.click()}
            >
                +
            </Button>
            <Input
                id="fileInput"
                className="hidden"
                type="file"
                onChange={onFileUpload}
            />
        </>
    );
}
