import React, { useCallback, useRef } from "@rbxts/react";
import { Point, Polygon } from "shared/polybool/polybool";

import { findClosestPoint, snapToGrid } from "./Canvas.utils";
import { PolygonState } from "./PolygonClipper.types";
import { Line, Vertex } from "./PolygonElements";

interface Props {
	polygonState: PolygonState;
	snap: boolean;
	onPolygonChange: (newState: PolygonState) => void;
}

export function Canvas({ polygonState, snap, onPolygonChange }: Props) {
	const canvasRef = useRef<Frame>();
	const dragInfo = useRef<{
		isDragging: boolean;
		polygon: "poly1" | "poly2";
		regionIndex: number;
		pointIndex: number;
		startPos: Point;
	}>();

	const CANVAS_HEIGHT = 400;

	const handleMouseDown = useCallback(
		(x: number, y: number) => {
			// Find closest point to click
			const closestPoint = findClosestPoint([x, y], polygonState);
			if (closestPoint && closestPoint.distance < 10) {
				dragInfo.current = {
					isDragging: true,
					polygon: closestPoint.polygon,
					regionIndex: closestPoint.regionIndex,
					pointIndex: closestPoint.pointIndex,
					startPos: [x, y],
				};
			}
		},
		[polygonState],
	);

	const handleMouseMove = useCallback(
		(x: number, y: number) => {
			if (!dragInfo.current?.isDragging) return;

			const { polygon, regionIndex, pointIndex } = dragInfo.current;
			const newPoint: Point = snap ? snapToGrid([x, y]) : [x, y];

			onPolygonChange({
				...polygonState,
				[polygon]: {
					...polygonState[polygon],
					regions: polygonState[polygon].regions.map((region, ri) =>
						ri === regionIndex ? region.map((point, pi) => (pi === pointIndex ? newPoint : point)) : region,
					),
				},
			});
		},
		[polygonState, snap],
	);

	const handleMouseUp = useCallback(() => {
		dragInfo.current = undefined;
	}, []);

	const renderPolygon = (polygon: Polygon, color: Color3, transparency = 0) => {
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
					/>,
				);
			}

			// Draw vertices
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
			ref={canvasRef}
			Event={{
				InputBegan: (_, input) => {
					if (input.UserInputType === Enum.UserInputType.MouseButton1) {
						const position = input.Position;
						handleMouseDown(position.X, position.Y);
					}
				},
				InputChanged: (_, input) => {
					if (input.UserInputType === Enum.UserInputType.MouseMovement) {
						const position = input.Position;
						handleMouseMove(position.X, position.Y);
					}
				},
				InputEnded: (_, input) => {
					if (input.UserInputType === Enum.UserInputType.MouseButton1) {
						handleMouseUp();
					}
				},
			}}
		>
			{renderPolygon(polygonState.poly1, Color3.fromRGB(255, 0, 0), 0.5)}
			{renderPolygon(polygonState.poly2, Color3.fromRGB(0, 0, 255), 0.5)}
			{renderPolygon(polygonState.result, Color3.fromRGB(0, 255, 0), 0)}
		</frame>
	);
}
