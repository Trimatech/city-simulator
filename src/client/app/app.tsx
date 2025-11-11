import React from "@rbxts/react";
import { Home } from "client/components/menu/home/home";

import { Alerts } from "../components/alerts";
import { BirdCamera } from "../components/camera/BirdCamera";
import { Controller } from "../components/controller";
import { ErrorHandler } from "../components/error-handler";
import { GameUI } from "../components/game/GameUI";
import { BackgroundMusic } from "../components/music/BackgroundMusic";
import { Preloader } from "../components/preloader";
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
				<Home />
			</Layer>

			<Layer>
				<Alerts />
			</Layer>
		</ErrorHandler>
	);
}
