import React, { useState } from "@rbxts/react";
import { useRem } from "client/hooks/use-rem";
import { pointToPolygon, Polygon } from "shared/polybool/polybool";

import { cutLinesFromPolygon, findClosestPoint, pointToVector2 } from "../polygon-clipper/PolygonCanvas.utils";
import { calculatePolygonOperation } from "../polygon-clipper/PolygonClipper.utils";
import { Checkbox } from "../ui/Checkbox";
import { Frame } from "../ui/frame";
import { DrawingCanvas } from "./DrawingCanvas";

interface Props {
	starterPolygon: Polygon;
}

export function DrawingPolygonClipper({ starterPolygon }: Props) {
	const rem = useRem();
	const [snap, setSnap] = useState(true);
	const [isAdditive, setIsAdditive] = useState(true);
	const [findClosest, setFindClosest] = useState(false);
	const [cutLine, setCutLine] = useState(true);
	const [resultPolygon, setResultPolygon] = useState<Polygon>(starterPolygon);

	const toolboxHeight = rem(6);

	if (!resultPolygon) return undefined;

	return (
		<Frame size={new UDim2(1, 0, 1, 0)}>
			<uilistlayout FillDirection="Vertical" />

			<DrawingCanvas
				polygon={resultPolygon}
				size={new UDim2(1, 0, 1, -toolboxHeight)}
				snap={snap}
				onDrawingComplete={(points) => {
					const operation = isAdditive ? "Union" : "Difference";
					if (findClosest) {
						const firstPoint = pointToVector2(points[0]);
						const lastPoint = pointToVector2(points[points.size() - 1]);

						const closestStart = findClosestPoint(firstPoint, [resultPolygon]);
						const closestEnd = findClosestPoint(lastPoint, [resultPolygon]);

						if (closestStart && closestEnd) {
							const takeFromPoints = [...resultPolygon.regions[closestStart.regionIndex]];

							let startIndex = closestStart.pointIndex;
							let endIndex = closestEnd.pointIndex;

							if (startIndex > endIndex) {
								[startIndex, endIndex] = [endIndex, startIndex];
							}

							const addToPoints = takeFromPoints.move(startIndex, endIndex, 0, []);

							const newPolygon = pointToPolygon([...addToPoints, ...points]);

							setResultPolygon(calculatePolygonOperation(resultPolygon, newPolygon, operation));
						} else {
							warn(`no closest found`);
						}
					} else if (cutLine) {
						const newPolygon = cutLinesFromPolygon(resultPolygon, points);
						warn(`newPolygon............`, newPolygon);
						setResultPolygon(calculatePolygonOperation(resultPolygon, newPolygon, operation));
					} else {
						const newPolygon = pointToPolygon(points);
						setResultPolygon(calculatePolygonOperation(resultPolygon, newPolygon, operation));
					}
				}}
			/>

			<Frame size={new UDim2(1, 0, 0, toolboxHeight)}>
				<uilistlayout
					FillDirection="Horizontal"
					Padding={new UDim(0, 10)}
					HorizontalAlignment="Center"
					VerticalAlignment="Center"
				/>

				<Checkbox checked={snap} onChecked={setSnap} text="Snap to Grid" />
				<Checkbox checked={isAdditive} onChecked={setIsAdditive} text="Is Additive" />
				<Checkbox checked={findClosest} onChecked={setFindClosest} text="Find Closest" />
				<Checkbox checked={cutLine} onChecked={setCutLine} text="Cut Line" />
			</Frame>
		</Frame>
	);
}
