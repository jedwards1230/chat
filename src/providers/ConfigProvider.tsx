"use client";

import { isMobile } from "@/app/utils";
import { configReducer } from "@/reducers/configReducer";
import {
	Dispatch,
	createContext,
	useContext,
	useEffect,
	useReducer,
	useState,
} from "react";

export const initialState: ConfigState = {
	sideBarOpen: true,
};

const ConfigContext = createContext<ConfigState>(initialState);
const ConfigDispatchContext = createContext<Dispatch<ConfigAction>>(() => {});

export const useConfig = () => useContext(ConfigContext);
export const useConfigDispatch = () => useContext(ConfigDispatchContext);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
	const [state, dispatch] = useReducer(configReducer, initialState);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") return;
		if (isMobile()) {
			state.sideBarOpen = false;
		}

		setMounted(true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (!mounted) return null;
	return (
		<ConfigContext.Provider value={state}>
			<ConfigDispatchContext.Provider value={dispatch}>
				{children}
			</ConfigDispatchContext.Provider>
		</ConfigContext.Provider>
	);
}
