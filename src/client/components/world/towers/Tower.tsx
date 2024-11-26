import { useEffect, useRef } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import { fadeModelOut } from "client/utils/animation.utils";
import { destroyWelds } from "client/utils/model.utils";
import { findSharedInstanceByPath } from "shared/SharedModelManager";
import { TowerEntity } from "shared/store/towers/tower-slice";

import { createAttackBeam, createRangeIndicator } from "./Tower.utils";

interface TowerProps {
	tower: TowerEntity;
	parentFolder: Folder | undefined;
}

// This component handles individual tower rendering
export function Tower({ tower, parentFolder }: TowerProps) {
	const modelRef = useRef<Model>();
	const rangeIndicatorRef = useRef<Part>();
	const beamRef = useRef<Beam>();
	const lastAttackTimeRef = useRef(tower.lastAttackTime);

	useEffect(() => {
		const loadTower = async () => {
			//warn("loadTower", tower);
			// Load the tower model
			const towerRawModel = await findSharedInstanceByPath<Model>("ReplicatedStorage/Models/Gameplay/Tower");
			const towerModel = towerRawModel.Clone();
			towerModel.PivotTo(new CFrame(tower.position.X, 0, tower.position.Y));
			towerModel.Parent = parentFolder;

			// Position the model in the world
			const position = new Vector3(tower.position.X, 0, tower.position.Y);
			towerModel.PivotTo(new CFrame(position));
			modelRef.current = towerModel;

			// Create range indicator
			const rangeIndicator = createRangeIndicator(tower.range, position);
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

	// Handle attack effects
	useEffect(() => {
		if (tower.lastAttackTime !== lastAttackTimeRef.current && tower.lastAttackPlayerName && modelRef.current) {
			lastAttackTimeRef.current = tower.lastAttackTime;

			// Clean up previous beam
			beamRef.current?.Destroy();

			// Create new attack beam effect
			const beam = createAttackBeam(modelRef.current, tower.lastAttackPlayerName);
			beamRef.current = beam;

			// Fade out beam after a short duration
			task.delay(0.1, () => {
				if (beam && beam.IsDescendantOf(game)) {
					const tweenInfo = new TweenInfo(0.2);
					const tween = TweenService.Create(beam, tweenInfo, {
						Width0: 0,
						Width1: 0,
					});
					tween.Completed.Connect(() => beam.Destroy());
					tween.Play();
				}
			});
		}
	}, [tower.lastAttackTime, tower.lastAttackPlayerName]);

	// The component doesn't render anything directly through JSX
	// since we're working with Models parented directly to workspace
	return undefined;
}
