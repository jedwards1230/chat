'use client';

import { useMemo } from 'react';

import { baseCommands } from '@/tools/commands';

type ToolCommand = {
    command: Command;
    tool: Tool;
};

export default function CommandOverlay({
    activeThread,
    activeCommand,
}: {
    activeThread: ChatThread;
    activeCommand: Command;
}) {
    const commands = useMemo(
        () =>
            !activeThread.agentConfig.toolsEnabled
                ? []
                : Object.keys(baseCommands).reduce((acc, command) => {
                      const com = command as Command;
                      if (
                          activeThread.agentConfig.tools.includes(
                              baseCommands[com],
                          )
                      ) {
                          acc.push({ command: com, tool: baseCommands[com] });
                      }
                      return acc;
                  }, [] as ToolCommand[]),
        [activeThread.agentConfig.tools, activeThread.agentConfig.toolsEnabled],
    );

    const availableCommands = useMemo(
        () =>
            activeCommand
                ? commands.filter((tool) =>
                      tool.command.includes(activeCommand),
                  )
                : commands,
        [activeCommand, commands],
    );

    if (availableCommands.length === 0) return null;
    return (
        <div className="rounded-rounded border border-border p-1 animate-in fade-in-50 slide-in-from-bottom-8">
            {availableCommands.map((tool, index) => (
                <div
                    key={index}
                    className="flex items-center gap-2 rounded-lg px-4 py-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-50 dark:focus:ring-blue-500 dark:focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
                >
                    <div>{tool.command}</div>
                    <div className="text-sm text-neutral-400">{tool.tool}</div>
                </div>
            ))}
        </div>
    );
}
