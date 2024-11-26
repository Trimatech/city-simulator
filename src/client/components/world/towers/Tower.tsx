import { useEffect, useRef } from "@rbxts/react";
import { palette } from "shared/constants/palette";
import { findSharedInstanceByPath } from "shared/SharedModelManager";
import { TowerEntity } from "shared/store/towers/tower-slice";

interface TowerProps {
	tower: TowerEntity;
	parentFolder: Folder | undefined;
}

// This component handles individual tower rendering
export function Tower({ tower, parentFolder }: TowerProps) {
	const modelRef = useRef<Model>();
	const rangeIndicatorRef = useRef<Part>();

	useEffect(() => {
		const loadTower = async () => {
			warn("loadTower", tower);
			// Load the tower model
			const towerRawModel = await findSharedInstanceByPath<Model>("ReplicatedStorage/Models/Gameplay/Tower");
			const towerModel = towerRawModel.Clone();
			towerModel.PivotTo(new CFrame(tower.position.X, 0, tower.position.Y));
			towerModel.Parent = parentFolder;

			// Position the model in the world
			const position = new Vector3(tower.position.X, 0, tower.position.Y);
			towerModel.PivotTo(new CFrame(position));

			// Store ref and set parent
			modelRef.current = towerModel;

			// Create range indicator
			const rangeIndicator = new Instance("Part");
			rangeIndicator.Name = "RangeIndicator";
			rangeIndicator.Shape = Enum.PartType.Cylinder;
			rangeIndicator.Size = new Vector3(1, tower.range * 2, tower.range * 2);
			rangeIndicator.CFrame = new CFrame(position)
				.mul(CFrame.Angles(0, 0, math.pi / 2))
				.add(new Vector3(0, 0.1, 0));
			rangeIndicator.Transparency = 0.9;
			rangeIndicator.Color = palette.red;
			rangeIndicator.Material = Enum.Material.SmoothPlastic;
			rangeIndicator.CanCollide = false;
			rangeIndicator.Anchored = true;

			rangeIndicatorRef.current = rangeIndicator;

			// Set parents
			rangeIndicator.Parent = towerModel;
		};

		if (parentFolder) {
			loadTower();
		}

		return () => {
			modelRef.current?.Destroy();
		};
	}, [parentFolder]);

	// The component doesn't render anything directly through JSX
	// since we're working with Models parented directly to workspace
	return undefined;
}
