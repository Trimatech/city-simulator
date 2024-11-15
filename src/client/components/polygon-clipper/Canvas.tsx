import React, { useCallback, useRef } from "@rbxts/react";
import { Point, Polygon } from "shared/polybool/polybool";

import { snapToGrid } from "./Canvas.utils";
import { PolygonState } from "./PolygonClipper.types";
import { Line, Vertex } from "./PolygonElements";

type PolygonName = "poly1" | "poly2" | "result";

interface Props {
	polygonState: PolygonState;
	snap: boolean;
	onPolygonChange: (newState: PolygonState) => void;
}

export function Canvas({ polygonState, snap, onPolygonChange }: Props) {
	const dragInfo = useRef<{
		isDragging: boolean;
		polygon: PolygonName;
		regionIndex: number;
		pointIndex: number;
	}>();

	const CANVAS_HEIGHT = 400;

	const handleInputBegan = useCallback(
		(rbx: Frame, input: InputObject) => {
			if (input.UserInputType === Enum.UserInputType.MouseButton1) {
				warn(`Input started`);
				const mousePos = input.Position;
				// Find closest vertex
				let closestDist = math.huge;
				let closest: { polygon: PolygonName; regionIndex: number; pointIndex: number } | undefined;

				["poly1", "poly2"].forEach((polyName) => {
					polygonState[polyName as PolygonName].regions.forEach((region, regionIndex) => {
						region.forEach((point, pointIndex) => {
							warn(`checking ${polyName} r${regionIndex} p${pointIndex}=${point[0]}_${point[1]}`);
							const framePosition = rbx.AbsolutePosition;
							const mouseX = mousePos.X - framePosition.X;
							const mouseY = mousePos.Y - framePosition.Y;
							warn(`.... mouse x=${mouseX}, y=${mouseY}`);

							const dist = math.sqrt(
								math.pow(mouseX - point[0], 2) + math.pow(CANVAS_HEIGHT - mouseY - point[1], 2),
							);
							warn(`....dist=${dist}`);
							if (dist < closestDist && dist < 10) {
								// 10 is hit radius
								closestDist = dist;
								closest = {
									polygon: polyName as PolygonName,
									regionIndex,
									pointIndex,
								};
							}
						});
					});
				});

				if (closest) {
					warn(`drag start for ${closest.polygon} ${closest.regionIndex} ${closest.pointIndex}`);
					dragInfo.current = {
						isDragging: true,
						...closest,
					};
				} else {
					warn(`no closest found`);
				}
			}
		},
		[polygonState],
	);

	const handleInputChanged = useCallback(
		(rbx: Frame, input: InputObject) => {
			if (!dragInfo.current?.isDragging) return;
			if (input.UserInputType === Enum.UserInputType.MouseMovement) {
				warn(`drag changed`);
				const position = input.Position;
				const framePosition = rbx.AbsolutePosition;
				const mouseX = position.X - framePosition.X;
				const mouseY = position.Y - framePosition.Y;
				const newPos: Point = [mouseX, CANVAS_HEIGHT - mouseY];
				const snappedPos = snap ? snapToGrid(newPos) : newPos;

				const { polygon, regionIndex, pointIndex } = dragInfo.current;
				onPolygonChange({
					...polygonState,
					[polygon]: {
						...polygonState[polygon],
						regions: polygonState[polygon].regions.map((region, ri) =>
							ri === regionIndex
								? region.map((point, pi) => (pi === pointIndex ? snappedPos : point))
								: region,
						),
					},
				});
			}
		},
		[polygonState, snap, onPolygonChange],
	);

	const handleInputEnded = useCallback((rbx: Frame, input: InputObject) => {
		if (input.UserInputType === Enum.UserInputType.MouseButton1) {
			warn(`drag ended`);
			dragInfo.current = undefined;
		}
	}, []);

	const renderPolygon = (polygon: Polygon, polyName: PolygonName, color: Color3, transparency = 0, thickness = 2) => {
		return polygon.regions.map((region, regionIdx) => {
			const elements: React.ReactElement[] = [];

			// Draw lines between points
			for (let i = 0; i < region.size(); i++) {
				const current = region[i] as Point;
				const nextPoint = region[(i + 1) % region.size()] as Point;

				elements.push(
					<Line
						key={`line-${regionIdx}-${i}`}
						startPoint={current}
						endPoint={nextPoint}
						color={color}
						transparency={transparency}
						canvasHeight={CANVAS_HEIGHT}
						thickness={thickness}
					/>,
				);
			}

			// Draw vertices (now without drag handlers)
			region.forEach((point, pointIdx) => {
				elements.push(
					<Vertex
						key={`vertex-${regionIdx}-${pointIdx}`}
						point={point as Point}
						color={color}
						transparency={transparency}
						canvasHeight={CANVAS_HEIGHT}
					/>,
				);
			});

			return elements;
		});
	};

	return (
		<frame
			BackgroundColor3={Color3.fromRGB(255, 255, 255)}
			Size={new UDim2(1, 0, 0, CANVAS_HEIGHT)}
			Event={{
				InputBegan: handleInputBegan,
				InputChanged: handleInputChanged,
				InputEnded: handleInputEnded,
			}}
		>
			{renderPolygon(polygonState.poly1, "poly1", Color3.fromRGB(255, 0, 0), 0.5, 4)}
			{renderPolygon(polygonState.poly2, "poly2", Color3.fromRGB(0, 0, 255), 0.5, 4)}
			{renderPolygon(polygonState.result, "result", Color3.fromRGB(0, 255, 0), 0, 1)}
		</frame>
	);
}
