import React, { useEffect, useRef } from "@rbxts/react";
import { UserInputService, Workspace } from "@rbxts/services";
import { remotes } from "shared/remotes";

import { getActiveTool, setActiveTool } from "./active-tool-state";
import { TOOLS } from "./tools";

export function ToolController() {
	const isMouseDownRef = useRef(false);

	function handleClick() {
		const camera = Workspace.CurrentCamera;
		if (!camera) return;

		const mousePos = UserInputService.GetMouseLocation();
		const ray = camera.ViewportPointToRay(mousePos.X, mousePos.Y);

		const params = new RaycastParams();
		params.FilterType = Enum.RaycastFilterType.Include;
		const cityFolder = Workspace.FindFirstChild("CityTiles");
		if (!cityFolder) return;
		params.AddToFilter([cityFolder]);

		const result = Workspace.Raycast(ray.Origin, ray.Direction.mul(1000), params);
		if (!result || !result.Instance) return;

		const tileX = result.Instance.GetAttribute("TileX") as number | undefined;
		const tileY = result.Instance.GetAttribute("TileY") as number | undefined;

		if (tileX !== undefined && tileY !== undefined) {
			remotes.city.placeTool.fire(getActiveTool(), tileX, tileY);
		}
	}

	useEffect(() => {
		// Keyboard shortcuts for tool selection
		const keyConn = UserInputService.InputBegan.Connect((input, gameProcessed) => {
			if (gameProcessed) return;
			for (const tool of TOOLS) {
				if (input.KeyCode === tool.shortcut) {
					setActiveTool(tool.id);
					return;
				}
			}
		});

		// Mouse click → raycast → place tool
		const mouseDownConn = UserInputService.InputBegan.Connect((input, gameProcessed) => {
			if (gameProcessed) return;
			if (input.UserInputType !== Enum.UserInputType.MouseButton1) return;
			isMouseDownRef.current = true;
			handleClick();
		});

		const mouseUpConn = UserInputService.InputEnded.Connect((input) => {
			if (input.UserInputType === Enum.UserInputType.MouseButton1) {
				isMouseDownRef.current = false;
			}
		});

		// Drag-paint for single-tile tools
		const mouseMoveConn = UserInputService.InputChanged.Connect((input) => {
			if (input.UserInputType !== Enum.UserInputType.MouseMovement) return;
			if (!isMouseDownRef.current) return;
			const tool = getActiveTool();
			if (tool === "road" || tool === "powerline" || tool === "rail" || tool === "bulldoze") {
				handleClick();
			}
		});

		return () => {
			keyConn.Disconnect();
			mouseDownConn.Disconnect();
			mouseUpConn.Disconnect();
			mouseMoveConn.Disconnect();
		};
	}, []);

	return <></>;
}
