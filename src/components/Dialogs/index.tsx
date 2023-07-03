"use client";

import { useChat } from "@/providers/ChatProvider";
import AgentEditor from "./AgentEditor";
import ConfigEditor from "./ConfigEditor";

export default function Dialogs() {
	const { agentEditorOpen, configEditorOpen } = useChat();
	return (
		<>
			{agentEditorOpen && <AgentEditor />}
			{configEditorOpen && <ConfigEditor />}
		</>
	);
}
