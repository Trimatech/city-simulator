import React, { useCallback, useEffect, useRef, useState } from "@rbxts/react";
import { palette } from "shared/constants/palette";
import { Point, Polygon } from "shared/polybool/polybool";

import { Frame } from "../ui/frame";
import { findClosestPoint, PolygonName, snapToGrid } from "./Canvas.utils";
import { Line, Vertex } from "./PolygonElements";

interface Props {
	size: UDim2;
	poly1: Polygon;

	poly2: Polygon;
	resultPolygon: Polygon;
	snap: boolean;
	onPolygonChange: (isPoly1: boolean, polygon: Polygon) => void;
}

export function Canvas({ size, poly1, poly2, resultPolygon, snap, onPolygonChange }: Props) {
	const dragInfo = useRef<{
		isDragging: boolean;
		isPoly1: boolean;
		regionIndex: number;
		pointIndex: number;
	}>();

	const frameRef = useRef<Frame>();
	const [canvasHeight, setCanvasHeight] = useState(400);

	useEffect(() => {
		if (frameRef.current) {
			setCanvasHeight(frameRef.current.AbsoluteSize.Y);
		}
	}, [frameRef.current?.AbsoluteSize.Y]);

	const handleInputBegan = useCallback(
		(rbx: Frame, input: InputObject) => {
			if (input.UserInputType === Enum.UserInputType.MouseButton1) {
				warn(`Input started`);
				const mousePos = input.Position;
				// Find closest vertex
				const closest = findClosestPoint(canvasHeight, rbx.AbsolutePosition, mousePos, poly1, poly2);

				if (closest) {
					warn(`drag start for isPoly1=${closest.isPoly1} ${closest.regionIndex} ${closest.pointIndex}`);
					dragInfo.current = {
						isDragging: true,
						...closest,
					};
				} else {
					warn(`no closest found`);
				}
			}
		},
		[poly1, poly2, canvasHeight],
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
				const newPos: Point = [mouseX, canvasHeight - mouseY];
				const snappedPos = snap ? snapToGrid(newPos) : newPos;

				const { isPoly1, regionIndex, pointIndex } = dragInfo.current;
				const changedPolygon = isPoly1 ? poly1 : poly2;
				changedPolygon.regions[regionIndex][pointIndex] = snappedPos;
				onPolygonChange(isPoly1, changedPolygon);
			}
		},
		[onPolygonChange, canvasHeight],
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
						canvasHeight={canvasHeight}
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
						canvasHeight={canvasHeight}
					/>,
				);
			});

			return elements;
		});
	};

	return (
		<Frame
			ref={frameRef}
			backgroundColor={palette.white}
			size={size}
			event={{
				InputBegan: handleInputBegan,
				InputChanged: handleInputChanged,
				InputEnded: handleInputEnded,
			}}
		>
			{renderPolygon(poly1, "poly1", Color3.fromRGB(255, 0, 0), 0.5, 4)}
			{renderPolygon(poly2, "poly2", Color3.fromRGB(0, 0, 255), 0.5, 4)}
			{renderPolygon(resultPolygon, "result", Color3.fromRGB(0, 255, 0), 0, 1)}
		</Frame>
	);
}
