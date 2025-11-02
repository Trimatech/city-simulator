import React, { memo, useEffect, useMemo, useState } from "@rbxts/react";

import { CellCandies } from "./CellCandies";

interface DelayedCellCandiesProps {
	cellKey: string;
}

function DelayedCellCandiesComponent({ cellKey }: DelayedCellCandiesProps) {
	const [isReady, setIsReady] = useState(false);

	const delaySeconds = useMemo(() => math.random() * 0.5, []);

	useEffect(() => {
		let isAlive = true;
		task.delay(delaySeconds, () => {
			if (isAlive) setIsReady(true);
		});
		return () => {
			isAlive = false;
		};
	}, [delaySeconds]);

	if (!isReady) return undefined;

	return <CellCandies cellKey={cellKey} />;
}

export const DelayedCellCandies = memo(DelayedCellCandiesComponent);
