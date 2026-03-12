import React, { useEffect, useMemo, useRef, useState } from "@rbxts/react";
import { InputCapture, Outline } from "@rbxts-ui/components";
import { Frame, Text } from "@rbxts-ui/primitives";
import { useRem } from "client/ui/rem/useRem";
import { palette } from "shared/constants/palette";

import { filterValidParts, safeCloneInstance, safeCloneInstances } from "./PartViewer.utils";

interface PartViewerProps {
	selectedParts?: Instance[];
	size?: UDim2;
	position?: UDim2;
	noBorder?: boolean;
	showGround?: boolean; // toggles base plate
	cameraRotation?: number;
	// Optional orbit camera controls (non-breaking)
	orbitEnabled?: boolean;
	orbitYawDeg?: number; // horizontal rotation in degrees
	orbitPitchDeg?: number; // vertical rotation in degrees (-89..89)
	orbitDistanceMultiplier?: number; // scales distance; 1 = default
	orbitTargetOffset?: Vector3; // pans target in world space
	// Built-in interactive orbit controls
	interactive?: boolean; // enables mouse drag + wheel controls
	interactiveSpeed?: number;
	// Loading overlay
	isLoading?: boolean;
}

const createBasePlate = (partMaxSize: number = 10) => {
	const basePlate = new Instance("Part");
	const size = 100 * partMaxSize;
	basePlate.Size = new Vector3(size, 1, size);
	basePlate.Position = new Vector3(0, 0, 0);
	basePlate.Color = Color3.fromRGB(138, 171, 133);
	basePlate.TopSurface = Enum.SurfaceType.Smooth;
	basePlate.Material = Enum.Material.SmoothPlastic;

	const texture = new Instance("Texture");
	texture.Texture = "rbxassetid://6372755229";
	texture.Transparency = 0.7;
	texture.StudsPerTileU = 8;
	texture.StudsPerTileV = 8;
	texture.Face = Enum.NormalId.Top;
	texture.Parent = basePlate;

	return basePlate;
};

export function PartViewer({
	selectedParts,
	size,
	position,
	noBorder,
	showGround = true,
	cameraRotation = 0,
	orbitEnabled,
	orbitYawDeg = 0,
	orbitPitchDeg = 25,
	orbitDistanceMultiplier = 1,
	orbitTargetOffset,
	interactive = false,
	interactiveSpeed = 1,
	isLoading = false,
}: PartViewerProps) {
	const rem = useRem();
	const cornerRadius = new UDim(0, rem(1));
	const parentFrameRef = useRef<Frame>();
	const viewportRef = useRef<ViewportFrame>();
	const cameraRef = useRef<Camera>();
	const modelRef = useRef<Model>();
	const basePlateRef = useRef<BasePart>();
	const partMaxDimensionRef = useRef(1);

	// Interactive orbit state
	const [interactiveYaw, setInteractiveYaw] = useState(30);
	const [interactivePitch, setInteractivePitch] = useState(20);
	const [interactiveDistanceMul, setInteractiveDistanceMul] = useState(orbitDistanceMultiplier);
	const [interactiveTargetOffset, setInteractiveTargetOffset] = useState(new Vector3(0, 0, 0));
	const [isRotating, setIsRotating] = useState(false);
	const [isPanning, setIsPanning] = useState(false);
	const [lastMouse, setLastMouse] = useState<Vector3>();

	// Effective orbit values (props override when not interactive)
	const effectiveOrbitEnabled = orbitEnabled || interactive;
	const effectiveYawDeg = interactive ? interactiveYaw : (orbitYawDeg ?? 0);
	const effectivePitchDeg = interactive ? interactivePitch : (orbitPitchDeg ?? 25);
	const effectiveDistanceMul = interactive ? interactiveDistanceMul : (orbitDistanceMultiplier ?? 1);
	const effectiveTargetOffset = interactive ? interactiveTargetOffset : (orbitTargetOffset ?? new Vector3(0, 0, 0));

	useEffect(() => {
		if (!viewportRef.current) return;

		// Filter to only allow valid archivable instances
		const filteredParts = filterValidParts(selectedParts || []);

		// Create a model to hold the cloned part or model
		const model = new Instance("Model");
		model.Parent = viewportRef.current;
		modelRef.current = model;

		// Clone the selected parts and their children if they exist
		if (filteredParts.size() > 0) {
			safeCloneInstances(filteredParts, model);
			model.PivotTo(new CFrame(0, 0, 0));
		}

		// Set up camera
		const camera = new Instance("Camera");
		camera.FieldOfView = 20;
		camera.Parent = viewportRef.current;
		viewportRef.current.CurrentCamera = camera;
		cameraRef.current = camera;

		// Calculate the bounding box of the part/model
		let maxDimension = 1;

		const basePlateHeight = 1;
		let partHeightOffset = 0;

		if (filteredParts.size() > 0) {
			// Create a temporary model to calculate bounding box
			const tempModel = new Instance("Model");

			// Clone all instances to temporary model
			for (const instance of filteredParts) {
				if (instance.IsA("BasePart") || instance.IsA("Model") || instance.IsA("Folder")) {
					safeCloneInstance(instance, tempModel);
				}
			}

			// Only calculate bounding box if there are valid children
			if (tempModel.GetChildren().size() > 0) {
				const boundingInfo = tempModel.GetBoundingBox();
				const boundingSize = boundingInfo[1];
				maxDimension = math.max(boundingSize.X, boundingSize.Y, boundingSize.Z);
				partHeightOffset = boundingSize.Y / 2;
			}

			// Clean up temporary model
			tempModel.Destroy();

			// Create or remove base plate depending on flag
			if (showGround) {
				basePlateRef.current?.Destroy();
				basePlateRef.current = createBasePlate(maxDimension);
				basePlateRef.current.Parent = viewportRef.current;
				basePlateRef.current.Position = new Vector3(0, -partHeightOffset - basePlateHeight / 2, 0);
			} else {
				basePlateRef.current?.Destroy();
				basePlateRef.current = undefined as unknown as BasePart;
			}
		}

		// store for interactive pan scale
		partMaxDimensionRef.current = maxDimension;

		// Position camera to view the part/model from a good distance
		// The distance is calculated to ensure the object is fully visible
		const baseDistance = maxDimension * 3;
		const cameraDistance = baseDistance * (effectiveOrbitEnabled ? math.max(0.2, effectiveDistanceMul) : 1);

		if (effectiveOrbitEnabled) {
			const target = effectiveTargetOffset ?? new Vector3(0, 0, 0);
			// Orbit camera using yaw/pitch around origin
			const yaw = math.rad(effectiveYawDeg);
			const pitch = math.rad(math.clamp(effectivePitchDeg, -89, 89));
			const cosPitch = math.cos(pitch);
			const sinPitch = math.sin(pitch);
			const cameraPosition = new Vector3(
				cosPitch * math.cos(yaw) * cameraDistance,
				sinPitch * cameraDistance,
				cosPitch * math.sin(yaw) * cameraDistance,
			);
			camera.CFrame = CFrame.lookAt(cameraPosition.add(target), target);
		} else {
			const angle = math.rad(cameraRotation);
			const cameraPosition = new Vector3(
				math.cos(angle) * cameraDistance,
				cameraDistance * 0.5,
				math.sin(angle) * cameraDistance,
			);
			camera.CFrame = CFrame.lookAt(cameraPosition, new Vector3(0, 0, 0));
		}

		return () => {
			model.Destroy();
			camera.Destroy();
		};
	}, [
		selectedParts,
		showGround,
		cameraRotation,
		effectiveOrbitEnabled,
		effectiveYawDeg,
		effectivePitchDeg,
		effectiveDistanceMul,
		effectiveTargetOffset,
	]);

	const viewportProps = useMemo(() => {
		return {
			LightColor: Color3.fromRGB(254, 252, 255),
			Ambient: Color3.fromRGB(163, 165, 167),
			LightDirection: new Vector3(-20, -70, -50),
		};
	}, []);

	return (
		<Frame
			ref={parentFrameRef}
			size={size ?? new UDim2(1, 0, 1, 0)}
			position={position}
			backgroundColor={Color3.fromRGB(40, 40, 40)}
		>
			<viewportframe ref={viewportRef} Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1} {...viewportProps}>
				{!noBorder && (
					<Outline
						cornerRadius={cornerRadius}
						innerTransparency={0.75}
						innerThickness={rem(1)}
						innerColor={palette.black}
						outerTransparency={1}
					/>
				)}
				<uicorner CornerRadius={cornerRadius} />
			</viewportframe>
			{interactive && (
				<InputCapture
					size={new UDim2(1, 0, 1, 0)}
					hoverOnly
					active
					onInputBegan={(_, input) => {
						if (input.UserInputType === Enum.UserInputType.MouseButton1) {
							setIsRotating(true);
							setLastMouse(input.Position);
						} else if (input.UserInputType === Enum.UserInputType.MouseButton2) {
							setIsPanning(true);
							setLastMouse(input.Position);
						}
					}}
					onInputEnded={(_, input) => {
						if (input.UserInputType === Enum.UserInputType.MouseButton1) {
							setIsRotating(false);
							setLastMouse(undefined);
						} else if (input.UserInputType === Enum.UserInputType.MouseButton2) {
							setIsPanning(false);
							setLastMouse(undefined);
						}
					}}
					onInputChanged={(_, input) => {
						if (input.UserInputType === Enum.UserInputType.MouseMovement && lastMouse) {
							const delta2 = input.Position.sub(lastMouse);
							const delta = new Vector2(delta2.X, delta2.Y);
							setLastMouse(input.Position);
							if (isRotating) {
								// Inverted controls: left drag rotates right, up drag moves part down

								setInteractiveYaw((prev) => prev + delta.X * interactiveSpeed);
								setInteractivePitch((prev) => math.clamp(prev + delta.Y * interactiveSpeed, -80, 80));
							} else if (isPanning) {
								const yaw = math.rad(effectiveYawDeg);
								const right = new Vector3(math.sin(yaw), 0, -math.cos(yaw));
								const up = new Vector3(0, 1, 0);
								const panScale = partMaxDimensionRef.current * 0.01;
								const move = right.mul(-delta.X * panScale).add(up.mul(delta.Y * panScale));
								setInteractiveTargetOffset((prev) => prev.add(move));
							}
						}
						if (input.UserInputType === Enum.UserInputType.MouseWheel) {
							// Roblox provides wheel delta on Position.Z for MouseWheel
							const dz = -input.Position.Z * 0.1;
							setInteractiveDistanceMul((prev) => math.clamp(prev + dz, 0.2, 5));
						}
					}}
				/>
			)}
			{isLoading && (
				<Frame
					size={new UDim2(1, 0, 1, 0)}
					backgroundTransparency={0.6}
					backgroundColor={Color3.fromRGB(51, 51, 51)}
				>
					<Text
						text={"Updating..."}
						textSize={rem(2)}
						textColor={Color3.fromRGB(255, 255, 255)}
						backgroundTransparency={1}
						size={new UDim2(1, 0, 1, 0)}
					/>
				</Frame>
			)}
		</Frame>
	);
}

// (Removed invalid hook usage at module scope)
