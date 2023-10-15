import { useChat } from '@/providers/ChatProvider';
import { Button } from '../ui/button';
import clsx from 'clsx';

export function SubmitButton({
    tokenCount,
    input,
    config,
}: {
    input: string;
    tokenCount: number;
    config: AgentConfig;
}) {
    const maxTokens = config.model.params?.maxTokens || 0;
    return (
        <div className="flex flex-col justify-end gap-1 p-1">
            {tokenCount > 0 && (
                <div
                    className={clsx(
                        'text-center text-sm',
                        maxTokens > 0 &&
                            tokenCount > maxTokens &&
                            'text-red-500',
                    )}
                    title={
                        tokenCount +
                        ' tokens' +
                        (maxTokens > 0 ? ' / ' + maxTokens + ' max tokens' : '')
                    }
                >
                    {tokenCount}
                </div>
            )}
            <Button
                size="sm"
                variant={input.length > 0 ? 'primaryBlue' : 'default'}
                type="submit"
            >
                Send
            </Button>
        </div>
    );
}

export function EditButtons() {
    const { handleSubmit, cancelEdit } = useChat();

    return (
        <div className="flex flex-col justify-end gap-1 p-1">
            <Button size="sm" variant="primaryBlue" onClick={handleSubmit}>
                Update
            </Button>
            <Button size="sm" onClick={cancelEdit}>
                Cancel
            </Button>
        </div>
    );
}
