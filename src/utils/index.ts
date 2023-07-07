export function serializeSaveData(saveData: SaveData | ShareData): string {
	if ("thread" in saveData) {
		return JSON.stringify({
			...saveData.thread,
			messages: JSON.stringify(saveData.thread.messages),
		});
	}
	return JSON.stringify({
		config: saveData.config,
		chatHistory: saveData.chatHistory.map((thread) => ({
			...thread,
			messages: JSON.stringify(thread.messages),
		})),
	});
}
