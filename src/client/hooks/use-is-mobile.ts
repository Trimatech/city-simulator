import React, { useContext } from "@rbxts/react";
import { UserInputService } from "@rbxts/services";

const IsMobileContext = React.createContext<boolean | undefined>(undefined);

export const IsMobileProvider = IsMobileContext.Provider;

export function useIsMobile() {
	const override = useContext(IsMobileContext);
	if (override !== undefined) {
		return override;
	}
	return UserInputService.TouchEnabled;
}
