"use client";

import { useState } from "react";

import { useChat, useChatDispatch } from "@/providers/ChatProvider";
import Dialog from "./Dialog";
import clsx from "clsx";
import { motion } from "framer-motion";
import AgentConfig from "../Config/AgentConfig";
import { PluginsConfig } from "../Config";

export default function AgentEditor() {
	const { pluginsEditorOpen } = useChat();
	const chatDispatch = useChatDispatch();
	const [activeTab, setActiveTab] = useState<"config" | "plugins">(
		pluginsEditorOpen ? "plugins" : "config"
	);

	return (
		<Dialog
			callback={() =>
				chatDispatch({
					type: pluginsEditorOpen
						? "TOGGLE_PLUGINS_EDITOR"
						: "TOGGLE_AGENT_EDITOR",
					payload: false,
				})
			}
		>
			<div className="w-full pb-4 text-xl font-medium text-center">
				Agent Editor
			</div>
			<div className="flex flex-col gap-4 h-96">
				<div className="relative flex flex-row gap-4 group">
					<button
						className={clsx(
							"flex-1 z-10 px-4 py-2 font-medium text-center rounded-lg",
							activeTab === "config"
								? "text-white"
								: "text-neutral-500 dark:text-neutral-400"
						)}
						onClick={() => setActiveTab("config")}
					>
						Config
					</button>
					<button
						className={clsx(
							"flex-1 z-10 px-4 py-2 font-medium text-center rounded-lg",
							activeTab === "plugins"
								? "text-white"
								: "text-neutral-500 dark:text-neutral-400"
						)}
						onClick={() => setActiveTab("plugins")}
					>
						Plugins
					</button>
					<motion.div
						layoutId="config-tab"
						className={clsx(
							"absolute top-0 group-hover:dark:bg-neutral-600 w-1/2 bg-neutral-600/40 h-full rounded-lg",
							activeTab === "config" ? "left-0" : "right-0"
						)}
					/>
				</div>
				{activeTab === "config" ? <AgentConfig /> : <PluginsConfig />}
			</div>
		</Dialog>
	);
}
