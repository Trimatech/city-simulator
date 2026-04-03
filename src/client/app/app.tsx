import React from "@rbxts/react";

import { CityCamera } from "../camera/city-camera";
import { ToolController } from "../input/tool-controller";
import { Toolbar } from "../ui/toolbar";

export function App() {
	return (
		<>
			<CityCamera />
			<ToolController />

			<screengui
				key="city-hud"
				ResetOnSpawn={false}
				IgnoreGuiInset
				ZIndexBehavior="Sibling"
				DisplayOrder={1}
				ScreenInsets={Enum.ScreenInsets.DeviceSafeInsets}
			>
				<Toolbar />
			</screengui>
		</>
	);
}
