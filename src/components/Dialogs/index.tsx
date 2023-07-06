"use client";

import { useChat } from "@/providers/ChatProvider";
import AgentEditor from "./AgentEditor";
import ConfigEditor from "./ConfigEditor";
import ShareChat from "./ShareChat";

export default function Dialogs() {
	const {
		agentEditorOpen,
		configEditorOpen,
		pluginsEditorOpen,
		shareModalOpen,
	} = useChat();
	return (
		<div className="w-full h-full transition-all">
			{(agentEditorOpen || pluginsEditorOpen) && <AgentEditor />}
			{configEditorOpen && <ConfigEditor />}
			{shareModalOpen && <ShareChat />}
		</div>
	);
}
