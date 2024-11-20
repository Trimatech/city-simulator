import React from "@rbxts/react";
import { palette } from "shared/constants/palette";
import { Point, Polygon } from "shared/polybool/polybool";

import { Wall } from "./Wall";

interface Props {
	points: Vector2[];
	color?: Color3;
	transparency?: number;
	thickness?: number;
	height?: number;
	position?: Vector3;
	isCrumbling?: boolean;
}

export function Walls({
	points,
	color = palette.white,
	transparency = 0,
	position = new Vector3(),
	isCrumbling = false,
}: Props) {
	if (!points || points.size() === 0) {
		warn("No points found in polygon");
		return undefined;
	}

	const polygon: Polygon = {
		regions: [points.map((point) => [point.X, point.Y])],
		inverted: false,
	};

	return (
		<>
			{polygon.regions.map((region) =>
				region.map((point, index) => {
					const nextPoint = region[index + 1] || region[0];
					return (
						<Wall
							key={`wall-${index}`}
							startPoint={point as Point}
							endPoint={nextPoint as Point}
							color={color}
							transparency={transparency}
							position={position}
							height={5.1}
							isCrumbling={isCrumbling}
						/>
					);
				}),
			)}
		</>
	);
}
