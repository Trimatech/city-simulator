import React, { useCallback, useEffect, useRef, useState } from "@rbxts/react";
import { palette } from "shared/constants/palette";
import { Polygon } from "shared/polybool/polybool";

import { Frame } from "../ui/frame";
import { findClosestPoint, updatePolygonPoint } from "./PolygonCanvas.utils";
import { PolygonShape } from "./PolygonShape";

interface Props {
	size: UDim2;
	poly1: Polygon;

	poly2: Polygon;
	resultPolygon: Polygon;
	snap: boolean;
	onPolygonChange: (isPoly1: boolean, polygon: Polygon) => void;
}

export function PolygonCanvas({ size, poly1, poly2, resultPolygon, snap, onPolygonChange }: Props) {
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

				const changedPolygon = updatePolygonPoint({
					input,
					rbx,
					canvasHeight,
					snap,
					isPoly1: dragInfo.current.isPoly1,
					regionIndex: dragInfo.current.regionIndex,
					pointIndex: dragInfo.current.pointIndex,
					poly1,
					poly2,
				});
				onPolygonChange(dragInfo.current.isPoly1, changedPolygon);
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
			<PolygonShape
				polygon={poly1}
				color={Color3.fromRGB(255, 0, 0)}
				transparency={0.5}
				thickness={4}
				canvasHeight={canvasHeight}
			/>
			<PolygonShape
				polygon={poly2}
				color={Color3.fromRGB(0, 0, 255)}
				transparency={0.5}
				thickness={4}
				canvasHeight={canvasHeight}
			/>
			<PolygonShape
				polygon={resultPolygon}
				color={Color3.fromRGB(0, 255, 0)}
				transparency={0}
				thickness={1}
				canvasHeight={canvasHeight}
			/>
		</Frame>
	);
}
