import React, { useCallback, useEffect, useRef, useState } from "@rbxts/react";
import { palette } from "shared/constants/palette";
import { Point, pointToPolygon, Polygon } from "shared/polybool/polybool";

import { calculateSnappedPosition } from "../polygon-clipper/PolygonCanvas.utils";
import { PolygonShape } from "../polygon-clipper/PolygonShape";
import { Frame } from "../ui/frame";

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
	const [canvasHeight, setCanvasHeight] = useState(400);

	useEffect(() => {
		if (frameRef.current) {
			setCanvasHeight(frameRef.current.AbsoluteSize.Y);
		}
	}, [frameRef.current?.AbsoluteSize.Y]);

	const handleInputBegan = useCallback(
		(rbx: Frame, input: InputObject) => {
			if (input.UserInputType === Enum.UserInputType.MouseButton1) {
				warn("Input began");
				const snappedPos = calculateSnappedPosition(input, rbx, canvasHeight, snap);

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
		[canvasHeight, snap, onDrawingComplete, isDrawing, previewPoints],
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
				polygon={pointToPolygon(previewPoints)}
				color={palette.red}
				transparency={0.5}
				thickness={4}
				canvasHeight={canvasHeight}
			/>
			<PolygonShape
				polygon={polygon}
				color={palette.blue}
				transparency={0.5}
				thickness={4}
				canvasHeight={canvasHeight}
			/>
		</Frame>
	);
}
