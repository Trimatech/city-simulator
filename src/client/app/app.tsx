import React, { useEffect, useRef } from "@rbxts/react";
import { Layer } from "@rbxts-ui/layout";
import { Frame } from "@rbxts-ui/primitives";

import { Alerts } from "../components/alerts";
import { BirdCamera } from "../components/camera/BirdCamera";
import { Controller } from "../components/controller";
import { ErrorHandler } from "../components/error-handler";
import { ImpactOverlay } from "../components/game/ImpactOverlay";
import { TurboOverlay } from "../components/game/TurboOverlay";
import { BackgroundMusic } from "../components/music/BackgroundMusic";
import { OverlayScreens } from "../components/OverlayScreens";
import { Preloader } from "../components/preloader";
import { Screens } from "../components/Screens";
import { TopbarScreens } from "../components/TopbarScreens";
import { PortalProvider } from "../providers/PortalProvider";
import { World } from "../components/world/World";

export function App() {
	const mainScreenGuiRef = useRef<ScreenGui>();
	const portalRef = useRef<Frame>();
	useEffect(() => {
		if (mainScreenGuiRef.current) {
			mainScreenGuiRef.current.ScreenInsets = Enum.ScreenInsets.CoreUISafeInsets;
		}
	}, [mainScreenGuiRef.current]);

	return (
		<ErrorHandler>
			<PortalProvider portalRef={portalRef}>
				<BackgroundMusic />
				<Preloader />
				{/* <Voice /> */}

				<Layer>
					<BirdCamera />
					<Controller />
					<World />
					<ImpactOverlay />
					<TurboOverlay />
				</Layer>

				<screengui
					key="topbar-screens"
					ResetOnSpawn={false}
					IgnoreGuiInset
					ZIndexBehavior="Sibling"
					DisplayOrder={2}
					ScreenInsets={Enum.ScreenInsets.TopbarSafeInsets}
				>
					<TopbarScreens />
				</screengui>

				<screengui
					key="main-screens"
					ref={mainScreenGuiRef}
					ResetOnSpawn={false}
					IgnoreGuiInset
					ZIndexBehavior="Sibling"
					DisplayOrder={3}
					ScreenInsets={Enum.ScreenInsets.DeviceSafeInsets}
				>
					<Screens />
				</screengui>

				<screengui
					key="overlay-screens"
					ResetOnSpawn={false}
					IgnoreGuiInset
					ZIndexBehavior="Sibling"
					DisplayOrder={4}
					ScreenInsets={Enum.ScreenInsets.None}
				>
					<OverlayScreens />
				</screengui>

				<screengui
					key="portal-target"
					ResetOnSpawn={false}
					IgnoreGuiInset
					ZIndexBehavior="Sibling"
					DisplayOrder={5}
					ScreenInsets={Enum.ScreenInsets.None}
				>
					<Frame ref={portalRef} size={new UDim2(1, 0, 1, 0)} backgroundTransparency={1} />
				</screengui>

				<screengui
					key="alerts"
					ResetOnSpawn={false}
					IgnoreGuiInset
					ZIndexBehavior="Sibling"
					DisplayOrder={10}
					ScreenInsets={Enum.ScreenInsets.None}
				>
					<Alerts />
				</screengui>
			</PortalProvider>
		</ErrorHandler>
	);
}
