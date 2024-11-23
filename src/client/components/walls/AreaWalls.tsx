import React, { memo } from "@rbxts/react";
import { palette } from "shared/constants/palette";
import { createParallelPolygon } from "shared/polygon.utils";

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
	offset?: number;
}

function AreaWallsComponent({
	skinId,
	points,
	color = palette.white,
	transparency = 0,
	isCrumbling = false,
	offset = 1,
}: Props) {
	if (!points || points.size() === 0) {
		warn("No points found in polygon");
		return undefined;
	}

	const innerPoints = createParallelPolygon(points, offset);

	return (
		<>
			{/* Outer walls */}
			{points.map((point, index) => {
				const nextPoint = points[index + 1] || points[0];
				return (
					<Wall
						key={`outer-wall-${index}`}
						folderName={`outerWall`}
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

			{/* Inner walls */}
			{innerPoints.map((point, index) => {
				const nextPoint = innerPoints[index + 1] || innerPoints[0];
				return (
					<Wall
						key={`inner-wall-${index}`}
						folderName={`innerWall`}
						startPoint={point}
						endPoint={nextPoint}
						color={color}
						transparency={transparency}
						height={5.5}
						isCrumbling={isCrumbling}
						skinId={skinId}
					/>
				);
			})}
		</>
	);
}

export const AreaWalls = memo(AreaWallsComponent);
