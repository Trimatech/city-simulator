import React, { useState } from "@rbxts/react";
import { useRem } from "client/hooks/use-rem";
import { pointToPolygon, Polygon } from "shared/polybool/polybool";

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
	const [isAdditive, setIsAdditive] = useState(false);
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
					const newPolygon = pointToPolygon(points);
					const operation = isAdditive ? "Union" : "Difference";
					setResultPolygon(calculatePolygonOperation(resultPolygon, newPolygon, operation));
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
			</Frame>
		</Frame>
	);
}
