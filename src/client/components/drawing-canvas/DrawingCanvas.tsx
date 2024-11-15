import React, { useCallback, useEffect, useRef, useState } from "@rbxts/react";
import { palette } from "shared/constants/palette";
import { Point } from "shared/polybool/polybool";

import { snapToGrid } from "../polygon-clipper/PolygonCanvas.utils";
import { Line } from "../polygon-clipper/PolygonElements";
import { Frame } from "../ui/frame";

interface Props {
	size: UDim2;
	snap: boolean;
	onDrawingComplete: (points: Point[]) => void;
}

export function DrawingCanvas({ size, snap, onDrawingComplete }: Props) {
	const frameRef = useRef<Frame>();
	const [canvasHeight, setCanvasHeight] = useState(400);
	const drawInfo = useRef<{
		isDrawing: boolean;
		startPoint: Point;
		currentPoint?: Point;
	}>();

	useEffect(() => {
		if (frameRef.current) {
			setCanvasHeight(frameRef.current.AbsoluteSize.Y);
		}
	}, [frameRef.current?.AbsoluteSize.Y]);

	const handleInputBegan = useCallback(
		(rbx: Frame, input: InputObject) => {
			if (input.UserInputType === Enum.UserInputType.MouseButton1) {
				const position = input.Position;
				const framePosition = rbx.AbsolutePosition;
				const mouseX = position.X - framePosition.X;
				const mouseY = position.Y - framePosition.Y;
				const startPos: Point = [mouseX, canvasHeight - mouseY];
				drawInfo.current = {
					isDrawing: true,
					startPoint: snap ? snapToGrid(startPos) : startPos,
				};
			}
		},
		[canvasHeight, snap],
	);

	const handleInputChanged = useCallback(
		(rbx: Frame, input: InputObject) => {
			if (!drawInfo.current?.isDrawing) return;
			if (input.UserInputType === Enum.UserInputType.MouseMovement) {
				const position = input.Position;
				const framePosition = rbx.AbsolutePosition;
				const mouseX = position.X - framePosition.X;
				const mouseY = position.Y - framePosition.Y;
				const currentPos: Point = [mouseX, canvasHeight - mouseY];
				drawInfo.current.currentPoint = snap ? snapToGrid(currentPos) : currentPos;
			}
		},
		[canvasHeight, snap],
	);

	const handleInputEnded = useCallback(
		(rbx: Frame, input: InputObject) => {
			if (input.UserInputType === Enum.UserInputType.MouseButton1) {
				if (drawInfo.current?.isDrawing && drawInfo.current.currentPoint) {
					const startPoint = drawInfo.current.startPoint;
					const endPoint = drawInfo.current.currentPoint;

					// Create rectangle points (clockwise order)
					const rectanglePoints: Point[] = [
						startPoint,
						[endPoint[0], startPoint[1]],
						endPoint,
						[startPoint[0], endPoint[1]],
					];

					onDrawingComplete(rectanglePoints);
					drawInfo.current = undefined;
				}
			}
		},
		[onDrawingComplete],
	);

	const renderPreview = () => {
		if (!drawInfo.current?.isDrawing || !drawInfo.current.currentPoint) return undefined;

		const startPoint = drawInfo.current.startPoint;
		const endPoint = drawInfo.current.currentPoint;
		const previewPoints: Point[] = [
			startPoint,
			[endPoint[0], startPoint[1]],
			endPoint,
			[startPoint[0], endPoint[1]],
		];

		const elements: React.ReactElement[] = [];
		for (let i = 0; i < previewPoints.size(); i++) {
			const currentPoint = previewPoints[i];
			const nextPoint = previewPoints[(i + 1) % previewPoints.size()];
			elements.push(
				<Line
					key={`preview-${i}`}
					startPoint={currentPoint}
					endPoint={nextPoint}
					color={Color3.fromRGB(128, 128, 128)}
					transparency={0.5}
					canvasHeight={canvasHeight}
					thickness={2}
				/>,
			);
		}
		return elements;
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
			{renderPreview()}
		</Frame>
	);
}
