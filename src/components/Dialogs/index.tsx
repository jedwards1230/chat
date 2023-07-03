"use client";

import { useChat } from "@/providers/ChatProvider";
import AgentEditor from "./AgentEditor";
import ConfigEditor from "./ConfigEditor";
import PluginsEditor from "./PluginsEditor";

export default function Dialogs() {
	const { agentEditorOpen, configEditorOpen, pluginsEditorOpen } = useChat();
	return (
		<>
			{agentEditorOpen && <AgentEditor />}
			{configEditorOpen && <ConfigEditor />}
			{pluginsEditorOpen && <PluginsEditor />}
		</>
	);
}
