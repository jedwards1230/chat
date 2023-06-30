"use client";

import { useConfig } from "@/providers/ConfigProvider";
import AgentEditor from "./AgentEditor";
import ConfigEditor from "./ConfigEditor";

export default function Dialogs() {
	const { agentEditorOpen, configEditorOpen } = useConfig();
	return (
		<>
			{agentEditorOpen && <AgentEditor />}
			{configEditorOpen && <ConfigEditor />}
		</>
	);
}
