import { useEffect, useRef } from "@rbxts/react";
import { Workspace } from "@rbxts/services";
import { WORLD_BOUNDS } from "shared/constants/core";
import { palette } from "shared/constants/palette";

import { createWorldWall } from "./WorldWall.utils";

interface Props {
	color?: Color3;
	transparency?: number;
}

export function WorldWall({ color = palette.white, transparency = 0 }: Props) {
	const wallRef = useRef<PartOperation>();

	useEffect(() => {
		const wall = createWorldWall({
			position: new Vector3(0, 0, 0),
			size: new Vector3(10, WORLD_BOUNDS * 2, WORLD_BOUNDS * 2),
			color,
			transparency,
		});
		wall.Parent = Workspace;
		wallRef.current = wall;

		return () => {
			wall.Destroy();
		};
	}, []);

	return undefined;
}
