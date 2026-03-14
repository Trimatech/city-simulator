import React, { useCallback, useRef, useState } from "@rbxts/react";
import { Frame } from "@rbxts-ui/primitives";
import { palette } from "shared/constants/palette";
import { Point, pointsToPolygon, Polygon } from "shared/polybool/polybool";

import { calculateSnappedPosition } from "../polygon-clipper/PolygonCanvas.utils";
import { PolygonShape } from "../polygon-clipper/PolygonShape";

interface Props {
	polygon: Polygon;
	size: UDim2;
	snap: boolean;
	onDrawingComplete: (points: Point[]) => void;
}

export function DrawingCanvas({ polygon, size, snap, onDrawingComplete }: Props) {
	const [isDrawing, setIsDrawing] = useState(false);
	const [previewPoints, setPreviewPoints] = useState<Point[]>([]);

	const frameRef = useRef<Frame>();

	const handleInputBegan = useCallback(
		(rbx: Frame, input: InputObject) => {
			if (input.UserInputType === Enum.UserInputType.MouseButton1) {
				warn("Input began");
				const snappedPos = calculateSnappedPosition(input, rbx, snap);

				if (!isDrawing) {
					setIsDrawing(true);
					setPreviewPoints([snappedPos]);
				} else {
					setPreviewPoints((prevPoints) => [...prevPoints, snappedPos]);
				}
			} else if (input.UserInputType === Enum.UserInputType.MouseButton2) {
				warn("Right click - Input ended");
				if (isDrawing) {
					onDrawingComplete(previewPoints);
					setIsDrawing(false);
					setPreviewPoints([]);
				}
			}
		},
		[snap, onDrawingComplete, isDrawing, previewPoints],
	);

	return (
		<Frame
			ref={frameRef}
			backgroundColor={palette.white}
			size={size}
			event={{
				InputBegan: handleInputBegan,
			}}
		>
			<PolygonShape
				polygon={pointsToPolygon(previewPoints)}
				color={palette.red}
				transparency={0.5}
				thickness={4}
			/>
			<PolygonShape polygon={polygon} color={palette.blue} transparency={0.5} thickness={4} />
		</Frame>
	);
}
