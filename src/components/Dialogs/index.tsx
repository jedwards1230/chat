"use client";

import { useChat } from "@/providers/ChatProvider";
import AgentEditor from "./AgentEditor";
import ConfigEditor from "./ConfigEditor";

export default function Dialogs() {
	const { agentEditorOpen, configEditorOpen, pluginsEditorOpen } = useChat();
	return (
		<div className="w-full h-full transition-all">
			{(agentEditorOpen || pluginsEditorOpen) && <AgentEditor />}
			{configEditorOpen && <ConfigEditor />}
		</div>
	);
}
