import React, { useRef } from "@rbxts/react";
import { Frame } from "@rbxts-ui/primitives";
import { PortalProvider } from "./PortalProvider";

export const PortalFrame = ({ children }: { children: React.ReactNode }) => {
	const frameRef = useRef<Frame>();
	return (
		<Frame size={new UDim2(1, 0, 1, 0)} backgroundTransparency={1} ref={frameRef}>
			<PortalProvider portalRef={frameRef}>{children}</PortalProvider>
		</Frame>
	);
};
