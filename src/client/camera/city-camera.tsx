import React, { useEffect } from "@rbxts/react";
import { RunService, UserInputService, Workspace } from "@rbxts/services";
import { MAP_HEIGHT, MAP_WIDTH, TILE_SIZE } from "shared/constants/core";

const CAMERA_HEIGHT = 200;
const CAMERA_ANGLE = -80; // degrees from horizontal (nearly top-down)
const PAN_SPEED = 120; // studs/second
const ZOOM_SPEED = 20;
const MIN_ZOOM = 60;
const MAX_ZOOM = 400;

const MAP_CENTER_X = (MAP_WIDTH * TILE_SIZE) / 2;
const MAP_CENTER_Z = (MAP_HEIGHT * TILE_SIZE) / 2;

export function CityCamera() {
	useEffect(() => {
		const camera = Workspace.CurrentCamera;
		if (!camera) return;

		camera.CameraType = Enum.CameraType.Scriptable;

		let posX = MAP_CENTER_X;
		let posZ = MAP_CENTER_Z;
		let height = CAMERA_HEIGHT;

		const angleRad = math.rad(CAMERA_ANGLE);
		const offsetY = math.cos(angleRad);
		const offsetZ = math.sin(angleRad);

		// Scroll zoom
		const scrollConn = UserInputService.InputChanged.Connect((input) => {
			if (input.UserInputType === Enum.UserInputType.MouseWheel) {
				height = math.clamp(height - input.Position.Z * ZOOM_SPEED, MIN_ZOOM, MAX_ZOOM);
			}
		});

		// Render loop for camera position
		const renderConn = RunService.RenderStepped.Connect((dt) => {
			// WASD / Arrow key panning
			if (UserInputService.IsKeyDown(Enum.KeyCode.W) || UserInputService.IsKeyDown(Enum.KeyCode.Up)) {
				posZ -= PAN_SPEED * dt;
			}
			if (UserInputService.IsKeyDown(Enum.KeyCode.S) || UserInputService.IsKeyDown(Enum.KeyCode.Down)) {
				posZ += PAN_SPEED * dt;
			}
			if (UserInputService.IsKeyDown(Enum.KeyCode.A) || UserInputService.IsKeyDown(Enum.KeyCode.Left)) {
				posX -= PAN_SPEED * dt;
			}
			if (UserInputService.IsKeyDown(Enum.KeyCode.D) || UserInputService.IsKeyDown(Enum.KeyCode.Right)) {
				posX += PAN_SPEED * dt;
			}

			// Clamp to map bounds with some margin
			const margin = height * 0.5;
			posX = math.clamp(posX, -margin, MAP_WIDTH * TILE_SIZE + margin);
			posZ = math.clamp(posZ, -margin, MAP_HEIGHT * TILE_SIZE + margin);

			// Position camera looking down at an angle
			const camPos = new Vector3(posX, height, posZ - height * offsetZ);
			const lookAt = new Vector3(posX, 0, posZ);

			camera!.CFrame = CFrame.lookAt(camPos, lookAt);
		});

		return () => {
			scrollConn.Disconnect();
			renderConn.Disconnect();
		};
	}, []);

	return <></>;
}
