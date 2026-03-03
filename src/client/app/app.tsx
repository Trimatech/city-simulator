import React from "@rbxts/react";

import { Alerts } from "../components/alerts";
import { BirdCamera } from "../components/camera/BirdCamera";
import { Controller } from "../components/controller";
import { ErrorHandler } from "../components/error-handler";
import { GameUI } from "../components/game/GameUI";
import { BackgroundMusic } from "../components/music/BackgroundMusic";
import { Preloader } from "../components/preloader";
import { Screens } from "../components/Screens";
import { World } from "../components/world/World";
import { Layer } from "../ui/layout/layer";

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
				<GameUI />
			</Layer>

			<Layer>
				<Screens />
			</Layer>

			<Layer>
				<Alerts />
			</Layer>
		</ErrorHandler>
	);
}
