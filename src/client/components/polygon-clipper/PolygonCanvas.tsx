import React, { useCallback, useRef } from "@rbxts/react";
import { Frame } from "@rbxts-ui/primitives";
import { palette } from "shared/constants/palette";
import { Polygon } from "shared/polybool/polybool";

import { findClosestPoint, getNormMousePos, updatePolygonPoint } from "./PolygonCanvas.utils";
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

	const handleInputBegan = useCallback(
		(rbx: Frame, input: InputObject) => {
			if (input.UserInputType === Enum.UserInputType.MouseButton1) {
				warn(`Input started`);
				const mousePos = getNormMousePos(input.Position, rbx.AbsolutePosition);
				const closest = findClosestPoint(mousePos, [poly1, poly2], 10);

				const isPoly1 = closest?.polygonIndex === 0;

				if (closest) {
					warn("drag start", { isPoly1, regionIndex: closest.regionIndex, pointIndex: closest.pointIndex });
					dragInfo.current = {
						isDragging: true,
						isPoly1,
						...closest,
					};
				} else {
					warn(`no closest found`);
				}
			}
		},
		[poly1, poly2],
	);

	const handleInputChanged = useCallback(
		(rbx: Frame, input: InputObject) => {
			if (!dragInfo.current?.isDragging) return;
			if (input.UserInputType === Enum.UserInputType.MouseMovement) {
				warn(`drag changed`);

				const changedPolygon = updatePolygonPoint({
					input,
					rbx,
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
		[onPolygonChange],
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
			<PolygonShape polygon={poly1} color={Color3.fromRGB(255, 0, 0)} transparency={0.5} thickness={4} />
			<PolygonShape polygon={poly2} color={Color3.fromRGB(0, 0, 255)} transparency={0.5} thickness={4} />
			<PolygonShape polygon={resultPolygon} color={Color3.fromRGB(0, 255, 0)} transparency={0} thickness={1} />
		</Frame>
	);
}
