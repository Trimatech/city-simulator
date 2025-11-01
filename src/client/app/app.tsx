import React from "@rbxts/react";

import { Alerts } from "../components/alerts";
import { BirdCamera } from "../components/camera/BirdCamera";
import { Controller } from "../components/controller";
import { ErrorHandler } from "../components/error-handler";
import { GameUI } from "../components/game";
import { Menu } from "../components/menu";
import { Music } from "../components/music";
import { Preloader } from "../components/preloader";
import { World } from "../components/world/World2";
import { Layer } from "../ui/layout/layer";

export function App() {
	return (
		<ErrorHandler>
			<Music />
			<Preloader />
			{/* <Voice /> */}

			<Layer>
				<BirdCamera />
				<Controller />
				<World />
				<GameUI />
			</Layer>

			<Layer>
				<Menu />
			</Layer>

			<Layer>
				<Alerts />
			</Layer>
		</ErrorHandler>
	);
}
