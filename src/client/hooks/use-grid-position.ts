import { useEffect, useRef, useState } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { RunService } from "@rbxts/services";
import { getObserverPosition2D } from "client/utils/camera-position.utils";
import { selectLocalIsSpawned } from "shared/store/soldiers";
import { getCellCoordFromPos } from "shared/utils/cell-key";

export function useGridPosition<TState>(selectResolution: (state: TState) => number) {
	const resolution = useSelector(selectResolution);
	const isSpawned = useSelector(selectLocalIsSpawned);
	const [position, setPosition] = useState<Vector2 | undefined>(undefined);
	const lastCellRef = useRef<Vector2 | undefined>(undefined);

	useEffect(() => {
		const conn = RunService.Heartbeat.Connect(() => {
			if (resolution <= 0) {
				lastCellRef.current = undefined;
				setPosition(undefined);
				return;
			}

			const pos2d = getObserverPosition2D({ preferCamera: !isSpawned });

			if (!pos2d) {
				lastCellRef.current = undefined;
				setPosition(undefined);
				return;
			}

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
	}, [resolution, isSpawned]);

	return position;
}
