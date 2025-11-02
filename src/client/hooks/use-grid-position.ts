import { useEffect, useRef, useState } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Players, RunService } from "@rbxts/services";
// no default; caller must pass a selector
import { getCellCoordFromPos } from "shared/utils/cell-key";

export function useGridPosition<TState>(selectResolution: (state: TState) => number) {
	const resolution = useSelector(selectResolution as unknown as (state: unknown) => number);
	const [position, setPosition] = useState<Vector2 | undefined>(undefined);
	const lastCellRef = useRef<Vector2 | undefined>(undefined);

	useEffect(() => {
		const conn = RunService.Heartbeat.Connect(() => {
			const character = Players.LocalPlayer?.Character;
			if (!character || resolution <= 0) {
				lastCellRef.current = undefined;
				setPosition(undefined);
				return;
			}

			const pivot = character.GetPivot();
			const pos2d = new Vector2(pivot.Position.X, pivot.Position.Z);
			const cell = getCellCoordFromPos(pos2d, resolution);
			const prev = lastCellRef.current;

			if (prev === undefined || cell.X !== prev.X || cell.Y !== prev.Y) {
				const nextCell = new Vector2(cell.X, cell.Y);
				lastCellRef.current = nextCell;
				setPosition(nextCell);
			}
		});
		return () => {
			conn.Disconnect();
			lastCellRef.current = undefined;
		};
	}, [resolution]);

	return position;
}
