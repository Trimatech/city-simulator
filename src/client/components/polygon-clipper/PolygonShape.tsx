import React from "@rbxts/react";
import { getNextRegion } from "shared/polybool/poly-utils";
import { Point, Polygon } from "shared/polybool/polybool";

import { Line, Vertex } from "./PolygonElements";

interface Props {
	polygon: Polygon;
	color: Color3;
	transparency?: number;
	thickness?: number;
}

export function PolygonShape({ polygon, color, transparency = 0, thickness = 2 }: Props) {
	return (
		<>
			{polygon.regions.map((region, regionIdx) => {
				// Draw lines between points
				const lineElements = region.map((_, i) => {
					const current = region[i] as Point;
					const nextPoint = getNextRegion(region, i);

					return (
						<Line
							key={`line-${regionIdx}-${i}`}
							startPoint={current}
							endPoint={nextPoint}
							color={color}
							transparency={transparency}
							thickness={thickness}
						/>
					);
				});

				const vertexElements = region.map((point, pointIdx) => (
					<Vertex
						key={`vertex-${regionIdx}-${pointIdx}`}
						point={point as Point}
						color={color}
						transparency={transparency}
					/>
				));

				return [...lineElements, ...vertexElements];
			})}
		</>
	);
}
