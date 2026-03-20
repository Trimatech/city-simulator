import React from "@rbxts/react";
import { Layer } from "@rbxts-ui/layout";

import { Alerts } from "../components/alerts";
import { BirdCamera } from "../components/camera/BirdCamera";
import { Controller } from "../components/controller";
import { ErrorHandler } from "../components/error-handler";
import { BackgroundMusic } from "../components/music/BackgroundMusic";
import { Preloader } from "../components/preloader";
import { Screens } from "../components/Screens";
import { ImpactOverlay } from "../components/game/ImpactOverlay";
import { World } from "../components/world/World";

export function App() {
	return (
		<ErrorHandler>
			<BackgroundMusic />
			<Preloader />
			{/* <Voice /> */}

			<Layer>
				<BirdCamera />
				<Controller />
				<World />
			</Layer>

			<Layer>
				<Screens />
				<ImpactOverlay />
			</Layer>

			<Layer>
				<Alerts />
			</Layer>
		</ErrorHandler>
	);
}
