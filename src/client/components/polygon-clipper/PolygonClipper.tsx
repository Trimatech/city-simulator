import React, { useCallback, useEffect, useState } from "@rbxts/react";
import { useRem } from "client/rem/use-rem";
import { calculatePolygonOperation, shapeToPolygon } from "shared/polybool/poly-utils";
import { Polygon } from "shared/polybool/polybool";

import { Checkbox } from "../../ui/Checkbox";
import { Frame } from "../../ui/layout/frame";
import { Text } from "../../ui/text";
import { CanvasButton } from "./CanvasButton";
import { DemoPolygon, demoPolygons } from "./demo-cases";
import { PolygonCanvas } from "./PolygonCanvas";
import { PolygonOperation } from "./PolygonClipper.types";

interface Props {
	initialDemoIndex?: number;
}
// https://unpkg.com/@velipso/polybool@2.0.11/demo/demo.html
export function PolygonClipper({ initialDemoIndex = 0 }: Props) {
	const rem = useRem();

	const [operation, setOperation] = useState<PolygonOperation>("Intersect");
	const [snap, setSnap] = useState(true);
	const [selectedDemo, setSelectedDemo] = useState<DemoPolygon>(demoPolygons[initialDemoIndex]);
	const [poly1, setPoly1] = useState<Polygon>();
	const [poly2, setPoly2] = useState<Polygon>();
	const [resultPolygon, setResultPolygon] = useState<Polygon>();

	useEffect(() => {
		if (selectedDemo) {
			print("Selected demo changed");
			if (selectedDemo.poly1 && selectedDemo.poly2) {
				setPoly1(selectedDemo.poly1);
				setPoly2(selectedDemo.poly2);
			} else if (selectedDemo.shape1 && selectedDemo.shape2) {
				setPoly1(shapeToPolygon(selectedDemo.shape1));
				setPoly2(shapeToPolygon(selectedDemo.shape2));
			}
		}
	}, [selectedDemo]);

	const handleNextDemo = useCallback(
		(direction: 1 | -1) => {
			const currentIndex = demoPolygons.findIndex((demo) => demo.name === selectedDemo.name);

			const nextDemoIndex = (currentIndex + direction + demoPolygons.size()) % demoPolygons.size();
			const nextDemo = demoPolygons[nextDemoIndex];
			print(`Next demo: ${nextDemo.name} currentIndex ${currentIndex} nextDemoIndex ${nextDemoIndex}`);
			setSelectedDemo(nextDemo);
		},
		[selectedDemo],
	);

	useEffect(() => {
		print("Polygons changed");
		if (poly1 && poly2) {
			setResultPolygon(calculatePolygonOperation(poly1, poly2, operation));
		} else {
			print("No polygons to calculate");
		}
	}, [poly1, poly2, operation]);

	const handleOperationChange = useCallback((newOperation: PolygonOperation) => {
		setOperation(newOperation);
	}, []);

	const toolboxHeight = rem(6);

	if (!poly1 || !poly2 || !resultPolygon) {
		print("No polygons to display");
		return undefined;
	}

	return (
		<Frame size={new UDim2(1, 0, 1, 0)}>
			<uilistlayout FillDirection="Vertical" />
			<PolygonCanvas
				size={new UDim2(1, 0, 1, -toolboxHeight)}
				poly1={poly1}
				poly2={poly2}
				resultPolygon={resultPolygon}
				snap={snap}
				onPolygonChange={(isPoly1, newPolygon) => {
					if (isPoly1) {
						setPoly1(newPolygon);
						setResultPolygon(calculatePolygonOperation(newPolygon, poly2, operation));
					} else {
						setPoly2(newPolygon);
						setResultPolygon(calculatePolygonOperation(poly1, newPolygon, operation));
					}
				}}
			/>

			<Frame position={new UDim2(0, 0, 0.8, 0)} size={new UDim2(1, 0, 0, toolboxHeight)}>
				<uilistlayout
					FillDirection="Horizontal"
					Padding={new UDim(0, 10)}
					HorizontalAlignment="Center"
					VerticalAlignment="Center"
				/>

				<Text key={"02"} text={selectedDemo.name} size={new UDim2(0, rem(9), 1, 0)} />
				<CanvasButton text="Intersect" onClick={() => handleOperationChange("Intersect")} />
				<CanvasButton text="Union" onClick={() => handleOperationChange("Union")} />
				<CanvasButton text="Red - Blue" onClick={() => handleOperationChange("Difference")} />
				<CanvasButton text="Blue - Red" onClick={() => handleOperationChange("DifferenceRev")} />
				<CanvasButton text="Xor" onClick={() => handleOperationChange("Xor")} />

				<CanvasButton text="Prev Demo" onClick={() => handleNextDemo(-1)} />
				<CanvasButton text="Next Demo" onClick={() => handleNextDemo(1)} />
				<Checkbox checked={snap} onChecked={setSnap} text="Snap to Grid" />
			</Frame>
		</Frame>
	);
}
