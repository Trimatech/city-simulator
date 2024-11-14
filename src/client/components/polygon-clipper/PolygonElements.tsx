import React from "@rbxts/react";
import { Point } from "shared/polybool/polybool";

import { Frame } from "../ui/frame";

interface LineProps {
	startPoint: Point;
	endPoint: Point;
	color: Color3;
	transparency?: number;
	thickness?: number;
	canvasHeight: number;
}

export function Line({ startPoint, endPoint, color, transparency = 0, thickness = 2, canvasHeight }: LineProps) {
	const newStart = [startPoint[0], canvasHeight - startPoint[1]] as Point;
	const newEnd = [endPoint[0], canvasHeight - endPoint[1]] as Point;

	const distance = math.sqrt(math.pow(newStart[0] - newEnd[0], 2) + math.pow(newStart[1] - newEnd[1], 2));

	const center = {
		X: (newStart[0] + newEnd[0]) / 2,
		Y: (newStart[1] + newEnd[1]) / 2,
	};

	const rotation = math.atan2(newStart[1] - newEnd[1], newStart[0] - newEnd[0]);

	return (
		<Frame
			backgroundColor={color}
			backgroundTransparency={transparency}
			size={new UDim2(0, distance, 0, thickness)}
			position={new UDim2(0, center.X, 0, center.Y)}
			anchorPoint={new Vector2(0.5, 0.5)}
			rotation={math.deg(rotation)}
		/>
	);
}

interface VertexProps {
	point: Point;
	color: Color3;
	transparency?: number;
	size?: number;
	canvasHeight: number;
}

export function Vertex({ point, color, transparency = 0, size = 6, canvasHeight }: VertexProps) {
	const offset = size / 2;
	const flippedY = canvasHeight - point[1];

	return (
		<Frame
			backgroundColor={color}
			backgroundTransparency={transparency}
			size={new UDim2(0, size, 0, size)}
			position={new UDim2(0, point[0] - offset, 0, flippedY - offset)}
			cornerRadius={new UDim(1, 0)}
		/>
	);
}
