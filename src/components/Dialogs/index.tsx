"use client";

import { useChat } from "@/providers/ChatProvider";
import AgentEditor from "./AgentEditor";
import ConfigEditor from "./ConfigEditor";
import PluginsEditor from "./PluginsEditor";
import SignIn from "./SignIn";

export default function Dialogs() {
	const { agentEditorOpen, configEditorOpen, pluginsEditorOpen, signInOpen } =
		useChat();
	return (
		<>
			{agentEditorOpen && <AgentEditor />}
			{configEditorOpen && <ConfigEditor />}
			{pluginsEditorOpen && <PluginsEditor />}
			{signInOpen && <SignIn />}
		</>
	);
}
