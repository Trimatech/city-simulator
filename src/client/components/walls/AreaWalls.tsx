import React, { memo } from "@rbxts/react";
import { palette } from "shared/constants/palette";

import { Wall } from "./Wall";

interface Props {
	skinId?: string;
	points: Vector2[];
	color?: Color3;
	transparency?: number;
	thickness?: number;
	height?: number;
	position?: Vector3;
	isCrumbling?: boolean;
}

function AreaWallsComponent({ skinId, points, color = palette.white, transparency = 0, isCrumbling = false }: Props) {
	if (!points || points.size() === 0) {
		warn("No points found in polygon");
		return undefined;
	}

	return (
		<>
			{points.map((point, index) => {
				const nextPoint = points[index + 1] || points[0];
				return (
					<Wall
						key={`wall-${index}`}
						name={`wall_${point.X}_${point.Y}_${nextPoint.X}_${nextPoint.Y}`}
						startPoint={point}
						endPoint={nextPoint}
						color={color}
						transparency={transparency}
						height={5.1}
						isCrumbling={isCrumbling}
						skinId={skinId}
					/>
				);
			})}
		</>
	);
}

export const AreaWalls = memo(AreaWallsComponent);
