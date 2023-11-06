import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { v4 as uuid } from 'uuid';
import * as z from 'zod';

import { defaultAgentConfig } from '@/providers/characters';
import { modelList, modelMap } from '@/providers/models';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useChat } from '@/providers/ChatProvider';
import { availableTools } from '@/tools/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
    id: z.string().optional(),
    name: z
        .string()
        .min(2, {
            message: 'Agent name must be at least 2 characters.',
        })
        .max(20, {
            message: 'Agent name must be at most 20 characters.',
        }),
    systemMessage: z.string().optional(),
    modelName: z.string(),
    streamResponse: z.boolean(),
    toolsEnabled: z.boolean(),
    tools: z.array(z.string()),
});

export default function CharacterSettings({
    agent,
    setActive,
}: {
    agent?: AgentConfig;
    setActive: (config: AgentConfig) => void;
}) {
    const {
        activeThread,
        updateThreadConfig,
        setSystemMessage,
        saveCharacter,
        characterList,
        defaultThread,
        streamResponse,
        setStreamResponse,
    } = useChat();

    const thread = activeThread || defaultThread;
    const initConfig = agent
        ? agent
        : {
              ...defaultAgentConfig,
              name: 'New Character',
          };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: initConfig.id,
            name: initConfig.name,
            systemMessage: initConfig.systemMessage,
            modelName: initConfig.model.name,
            streamResponse,
            toolsEnabled: initConfig.toolsEnabled,
            tools: initConfig.tools,
        },
    });

    const onSubmit = async (
        values: z.infer<typeof formSchema>,
        isNew: boolean = false,
    ) => {
        if (isNew) {
            if (characterList.find((c) => c.name === values.name)) {
                form.setError('name', {
                    type: 'manual',
                    message: 'Character name must be unique.',
                });
                return;
            }
            values.id = uuid();
        }
        const config: AgentConfig = {
            ...values,
            id: values.id || initConfig.id,
            systemMessage: values.systemMessage || '',
            model: modelMap[values.modelName as Model],
            tools: values.tools as Tool[],
        };

        saveCharacter(config);
        setActive(config);
        if (thread) {
            setStreamResponse(values.streamResponse);
            setSystemMessage(config.systemMessage);
            updateThreadConfig(config);
        }
    };

    const toggleTool = (tool: string) => {
        const currentTools = form.getValues('tools');
        if (currentTools.includes(tool)) {
            // If the tool is currently selected, remove it from the array
            form.setValue(
                'tools',
                currentTools.filter((t) => t !== tool),
            );
        } else {
            // If the tool is not currently selected, add it to the array
            form.setValue('tools', [...currentTools, tool]);
        }
    };

    const modelName = form.watch('modelName') as Model;
    const model = modelMap[modelName];
    const functionsAllowed = model.api !== 'llama';
    const streamingAllowed = model.api !== 'llama';

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit((v) => onSubmit(v))}
                className="flex h-full flex-col justify-between gap-2"
            >
                <div className="h-full w-full space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Agent Name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Agent Name"
                                        required
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="systemMessage"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>System Message</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Agent System Message"
                                        required
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="modelName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Model</FormLabel>
                                <FormControl>
                                    <Select
                                        {...field}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue
                                                placeholder={field.value}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {modelList.map((model) => (
                                                <SelectItem
                                                    key={'select-' + model.name}
                                                    value={model.name}
                                                >
                                                    {model.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {streamingAllowed && (
                        <FormField
                            control={form.control}
                            name="streamResponse"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <FormLabel className="flex w-full items-center justify-between rounded p-1 hover:bg-secondary">
                                            Stream Response
                                            <Checkbox
                                                id="stream-response"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormLabel>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                    {functionsAllowed && (
                        <div className="w-full space-y-2">
                            <FormField
                                control={form.control}
                                name="toolsEnabled"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <FormLabel className="flex w-full items-center justify-between rounded p-1 hover:bg-secondary">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="font-semibold text-neutral-950 transition-colors dark:text-neutral-100">
                                                        Plugins
                                                    </div>
                                                    {field.value && (
                                                        <div className="text-xs text-neutral-600 transition-colors dark:text-neutral-400">
                                                            {
                                                                form.watch(
                                                                    'tools',
                                                                ).length
                                                            }{' '}
                                                            enabled
                                                        </div>
                                                    )}
                                                </div>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormLabel>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {form.watch('toolsEnabled') && (
                                <FormItem className="pl-2">
                                    {availableTools.map((tool) => (
                                        <FormLabel
                                            key={tool}
                                            className="flex items-center justify-between rounded p-1 hover:bg-secondary"
                                        >
                                            {tool}
                                            <Checkbox
                                                id={tool}
                                                checked={form
                                                    .watch('tools')
                                                    .includes(tool)}
                                                onCheckedChange={() =>
                                                    toggleTool(tool)
                                                }
                                            >
                                                {tool}
                                            </Checkbox>
                                        </FormLabel>
                                    ))}
                                </FormItem>
                            )}
                        </div>
                    )}
                </div>
                <FormMessage />
                <div className="mt-auto flex w-full justify-end">
                    <SaveButton
                        onSubmit={onSubmit}
                        formValues={form.getValues}
                    />
                </div>
            </form>
        </Form>
    );
}

function SaveButton({
    onSubmit,
    formValues,
}: {
    onSubmit: Function;
    formValues: () => z.infer<typeof formSchema>;
}) {
    return (
        <div className="flex items-center">
            <Button
                variant="outlineAccent"
                type="submit"
                className="rounded-r-none border-r-0"
            >
                Save
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        className="rounded-l-none border-l-0"
                        variant="outlineAccent"
                    >
                        <ChevronDown size={16} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="">
                    <DropdownMenuItem
                        onClick={() => onSubmit(formValues(), true)}
                    >
                        Save As New
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
