export function configReducer(state: ConfigState, action: ConfigAction) {
	switch (action.type) {
		case "TOGGLE_SIDEBAR":
			return {
				...state,
				sideBarOpen: action.payload ?? !state.sideBarOpen,
			};
		case "TOGGLE_AGENT_EDITOR":
			return {
				...state,
				agentEditorOpen: action.payload ?? !state.agentEditorOpen,
			};
		case "TOGGLE_CONFIG_EDITOR":
			return {
				...state,
				configEditorOpen: action.payload ?? !state.configEditorOpen,
			};
		default:
			return state;
	}
}
