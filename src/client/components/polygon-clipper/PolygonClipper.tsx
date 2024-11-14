import React, { useCallback, useState } from "@rbxts/react";

import { Checkbox } from "../ui/Checkbox";
import { Canvas } from "./Canvas";
import { CanvasButton } from "./CanvasButton";
import { demoPolygons } from "./demo-cases";
import { PolygonOperation, PolygonState } from "./PolygonClipper.types";
import { calculatePolygonOperation } from "./PolygonClipper.utils";

interface Props {
	initialDemoIndex?: number;
}

export function PolygonClipper({ initialDemoIndex = 0 }: Props) {
	const [currentDemo, setCurrentDemo] = useState(initialDemoIndex);
	const [operation, setOperation] = useState<PolygonOperation>("Intersect");
	const [snap, setSnap] = useState(true);
	const [polygonState, setPolygonState] = useState<PolygonState>(() => ({
		poly1: demoPolygons[currentDemo].poly1,
		poly2: demoPolygons[currentDemo].poly2,
		result: calculatePolygonOperation(demoPolygons[currentDemo].poly1, demoPolygons[currentDemo].poly2, operation),
	}));

	const handleOperationChange = useCallback((newOperation: PolygonOperation) => {
		setOperation(newOperation);
		setPolygonState((prev) => ({
			...prev,
			result: calculatePolygonOperation(prev.poly1, prev.poly2, newOperation),
		}));
	}, []);

	const handleNextDemo = useCallback(
		(direction: 1 | -1) => {
			setCurrentDemo((prev) => {
				const nextDemo = ((prev + direction) % demoPolygons.size()) + demoPolygons.size();
				const demo = demoPolygons[nextDemo];
				setPolygonState({
					poly1: demo.poly1,
					poly2: demo.poly2,
					result: calculatePolygonOperation(demo.poly1, demo.poly2, operation),
				});
				return nextDemo;
			});
		},
		[operation],
	);

	return (
		<frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
			<Canvas polygonState={polygonState} snap={snap} onPolygonChange={(newState) => setPolygonState(newState)} />

			<frame BackgroundTransparency={0} Position={new UDim2(0, 0, 0.8, 0)} Size={new UDim2(1, 0, 0.2, 0)}>
				<uilistlayout FillDirection="Horizontal" Padding={new UDim(0, 10)} HorizontalAlignment="Center" />

				<CanvasButton text="Intersect" onClick={() => handleOperationChange("Intersect")} />
				<CanvasButton text="Union" onClick={() => handleOperationChange("Union")} />
				<CanvasButton text="Red - Blue" onClick={() => handleOperationChange("Difference")} />
				<CanvasButton text="Blue - Red" onClick={() => handleOperationChange("DifferenceRev")} />
				<CanvasButton text="Xor" onClick={() => handleOperationChange("Xor")} />

				<CanvasButton text="Prev Demo" onClick={() => handleNextDemo(-1)} />
				<CanvasButton text="Next Demo" onClick={() => handleNextDemo(1)} />
				<Checkbox checked={snap} onChecked={setSnap} text="Snap to Grid" />
			</frame>
		</frame>
	);
}
