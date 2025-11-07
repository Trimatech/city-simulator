import { useEffect, useRef } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { waitForPrimaryPart } from "@rbxts/wait-for";
import { fadeModelOut } from "client/utils/animation.utils";
import { destroyWelds } from "client/utils/model.utils";
import { palette } from "shared/constants/palette";
import { loadSharedCloneByPath } from "shared/SharedModelManager";
import { selectTowerById } from "shared/store/towers/tower-selectors";
import { TowerEntity } from "shared/store/towers/tower-slice";

import { createAttackBeam, createRangeIndicator } from "./Tower.utils";

interface TowerProps {
	towerId: string;
	parentFolder: Folder | undefined;
}

const emptyTower: TowerEntity = {
	id: "",
	position: new Vector2(0, 0),
	ownerId: "",
	range: 0,
	damage: 0,
	lastAttackTime: 0,
	lastAttackPlayerName: undefined,
	hasEnemyInRange: false,
	currentTargetId: undefined,
};
// This component handles individual tower rendering
export function Tower({ towerId, parentFolder }: TowerProps) {
	const tower = useSelector(selectTowerById(towerId)) ?? emptyTower;

	const modelRef = useRef<Model>();
	const rangeIndicatorRef = useRef<Part>();
	const beamRef = useRef<Beam>();

	useEffect(() => {
		const loadTower = async () => {
			//warn("loadTower", tower);
			// Load the tower model
			const towerModel = await loadSharedCloneByPath<Model>("ReplicatedStorage/Models/Gameplay/Tower");
			const primaryPart = await waitForPrimaryPart(towerModel);

			// Position the model in the world
			const position = new Vector3(tower.position.X, primaryPart.Size.Y / 2, tower.position.Y);
			towerModel.PivotTo(new CFrame(position));
			towerModel.Parent = parentFolder;
			modelRef.current = towerModel;

			const rangeIndicatorPosition = new Vector3(tower.position.X, 2, tower.position.Y);
			// Create range indicator (neutral by default)
			const rangeIndicator = createRangeIndicator(tower.range, rangeIndicatorPosition);
			rangeIndicator.Transparency = 0.85;
			rangeIndicator.Color = palette.surface1;
			rangeIndicator.Parent = towerModel;
			rangeIndicatorRef.current = rangeIndicator;
		};

		if (parentFolder) {
			loadTower();
		}

		return () => {
			if (modelRef.current) {
				destroyWelds(modelRef.current);
				fadeModelOut(modelRef.current);
			}
			beamRef.current?.Destroy();
		};
	}, [parentFolder]);

	// Dynamic range indicator color by enemy presence
	useEffect(() => {
		const part = rangeIndicatorRef.current;
		if (!part) return;
		if (tower.hasEnemyInRange) {
			part.Color = palette.red;
			part.Transparency = 0.65;
		} else {
			part.Color = palette.surface1;
			part.Transparency = 0.85;
		}
	}, [tower.hasEnemyInRange]);

	print("currentTargetId", tower.currentTargetId);

	// Persistent beam while a target exists
	useEffect(() => {
		if (!modelRef.current) return;
		const targetId = tower.currentTargetId;

		beamRef.current?.Destroy();

		if (targetId !== undefined) {
			const beam = createAttackBeam(modelRef.current, targetId);
			beamRef.current = beam;
		}
	}, [tower.currentTargetId]);

	// The component doesn't render anything directly through JSX
	// since we're working with Models parented directly to workspace
	return undefined;
}
