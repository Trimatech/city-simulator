import { memo, useEffect, useRef } from "@rbxts/react";
import { TweenService, Workspace } from "@rbxts/services";
import { palette } from "shared/constants/palette";

interface Props {
	position: Vector2;
	color?: Color3;
	transparency?: number;
	size?: number;
	name: string;
	eatenAt?: Vector2;
}

const CONTAINER_NAME = "Candies";
let candiesFolder: Folder | undefined;

function ensureCandiesFolder(): Folder {
	if (candiesFolder && candiesFolder.Parent) return candiesFolder;
	let folder = Workspace.FindFirstChild(CONTAINER_NAME) as Folder | undefined;
	if (!folder) {
		folder = new Instance("Folder");
		folder.Name = CONTAINER_NAME;
		folder.Parent = Workspace;
	}
	candiesFolder = folder;
	return folder;
}

const ANIMATION_DURATION = 1;
const FROM_GROUND = 4;
const FLOAT_HEIGHT = 15;
const FINAL_SIZE = 0.1;

function CandyComponent({ position, color = palette.white, transparency = 0.25, size = 2, name, eatenAt }: Props) {
	const sphereRef = useRef<Part>();
	const cleanupRef = useRef<() => void>();

	print(`render candy, eatenAt=${eatenAt}`);

	useEffect(() => {
		// Create candy sphere
		const sphere = new Instance("Part");
		sphere.Name = name;
		sphere.Shape = Enum.PartType.Ball;
		sphere.Size = new Vector3(size, size, size);
		sphere.Position = new Vector3(position.X, FROM_GROUND, position.Y);
		sphere.Color = color;
		sphere.Transparency = transparency;
		sphere.Material = Enum.Material.Neon;
		sphere.TopSurface = Enum.SurfaceType.Smooth;
		sphere.BottomSurface = Enum.SurfaceType.Smooth;
		sphere.Anchored = true;
		sphere.CanCollide = false;
		sphere.Parent = ensureCandiesFolder();
		sphere.CastShadow = false;

		sphereRef.current = sphere;

		// Handle eaten animation if eatenAt is set
		if (eatenAt !== undefined) {
			const startPosition = sphere.Position;
			const endPosition = startPosition.add(new Vector3(0, FLOAT_HEIGHT, 0));
			const endSize = new Vector3(FINAL_SIZE, FINAL_SIZE, FINAL_SIZE);

			// Create tweens
			const positionTween = TweenService.Create(
				sphere,
				new TweenInfo(ANIMATION_DURATION, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
				{ Position: endPosition },
			);

			const sizeTween = TweenService.Create(
				sphere,
				new TweenInfo(ANIMATION_DURATION, Enum.EasingStyle.Quad, Enum.EasingDirection.In),
				{ Size: endSize },
			);

			// Play tweens
			positionTween.Play();
			sizeTween.Play();

			// Cleanup tweens
			cleanupRef.current = () => {
				positionTween.Cancel();
				sizeTween.Cancel();
			};
		}

		return () => {
			cleanupRef.current?.();
			if (sphereRef.current) {
				sphereRef.current.Destroy();
				sphereRef.current = undefined;
			}
		};
	}, [position.X, position.Y, color, transparency, size, eatenAt]);

	return undefined;
}

export const Candy = memo(CandyComponent);
