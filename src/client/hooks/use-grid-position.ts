import { useEffect, useState } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Players, RunService } from "@rbxts/services";
import { selectGridResolution } from "shared/store/grid/grid-selectors";
import { getCellCoordFromPos } from "shared/utils/cell-key";

export function useGridPosition() {
	const resolution = useSelector(selectGridResolution);
	const [position, setPosition] = useState<Vector2 | undefined>(undefined);

	useEffect(() => {
		const conn = RunService.Heartbeat.Connect(() => {
			const character = Players.LocalPlayer?.Character;
			if (!character || resolution <= 0) {
				setPosition(undefined);
				return;
			}

			const pivot = character.GetPivot();
			const pos2d = new Vector2(pivot.Position.X, pivot.Position.Z);
			const cell = getCellCoordFromPos(pos2d, resolution);

			if (cell.X !== position?.X) {
				setPosition(new Vector2(cell.X, cell.Y));
			} else if (cell.Y !== position?.Y) {
				setPosition(new Vector2(cell.X, cell.Y));
			}
		});
		return () => conn.Disconnect();
	}, [resolution, position]);

	return position;
}
