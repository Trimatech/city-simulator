import React from "@rbxts/react";
import { Point, Polygon } from "shared/polybool/polybool";

import { getNextRegion } from "./PolygonCanvas.utils";
import { Line, Vertex } from "./PolygonElements";

interface Props {
	polygon: Polygon;
	color: Color3;
	transparency?: number;
	thickness?: number;
	canvasHeight: number;
}

export function PolygonShape({ polygon, color, transparency = 0, thickness = 2, canvasHeight }: Props) {
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
							canvasHeight={canvasHeight}
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
						canvasHeight={canvasHeight}
					/>
				));

				return [...lineElements, ...vertexElements];
			})}
		</>
	);
}
