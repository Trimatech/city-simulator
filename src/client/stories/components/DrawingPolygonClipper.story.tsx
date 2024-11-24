import "client/app/react-config";

import { hoarcekat } from "@rbxts/pretty-react-hooks";
import React from "@rbxts/react";
import { DrawingPolygonClipper } from "client/components/drawing-canvas/DrawingPolygonClipper";
import { RootProvider } from "client/providers/root-provider";
import { pointsToPolygon } from "shared/polybool/polybool";

const starterPolygon = pointsToPolygon([
	[200, 50],
	[600, 50],
	[600, 150],
	[200, 150],
]);

export = hoarcekat(() => {
	return (
		<RootProvider>
			<DrawingPolygonClipper starterPolygon={starterPolygon} />
		</RootProvider>
	);
});
