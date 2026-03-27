import React, { createContext, MutableRefObject, useContext } from "@rbxts/react";

interface PortalContextType {
	portalRef: MutableRefObject<Frame | undefined>;
}

const PortalContext = createContext<PortalContextType>({
	portalRef: { current: undefined },
});

export function usePortal() {
	const context = useContext(PortalContext);
	if (!context) {
		error("usePortal must be used within a PortalProvider");
	}
	return context;
}

interface PortalProviderProps {
	children: React.ReactNode;
	portalRef: MutableRefObject<Frame | undefined>;
}

export function PortalProvider({ children, portalRef }: PortalProviderProps) {
	return <PortalContext.Provider value={{ portalRef }}>{children}</PortalContext.Provider>;
}
