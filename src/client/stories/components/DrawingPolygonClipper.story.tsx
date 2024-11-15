import "client/app/react-config";

import { hoarcekat } from "@rbxts/pretty-react-hooks";
import React from "@rbxts/react";
import { DrawingPolygonClipper } from "client/components/drawing-canvas/DrawingPolygonClipper";
import { RootProvider } from "client/providers/root-provider";
import { pointToPolygon } from "shared/polybool/polybool";

const starterPolygon = pointToPolygon([
	[0, 0],
	[10, 0],
	[10, 10],
	[0, 10],
]);

export = hoarcekat(() => {
	return (
		<RootProvider>
			<DrawingPolygonClipper starterPolygon={starterPolygon} />
		</RootProvider>
	);
});
