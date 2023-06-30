export function configReducer(state: ConfigState, action: ConfigAction) {
	switch (action.type) {
		case "TOGGLE_SIDEBAR":
			return {
				...state,
				sideBarOpen: action.payload ?? !state.sideBarOpen,
			};
		default:
			return state;
	}
}
