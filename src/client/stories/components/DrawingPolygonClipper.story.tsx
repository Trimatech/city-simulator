import "client/app/react-config";

import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { DrawingPolygonClipper } from "client/components/drawing-canvas/DrawingPolygonClipper";
import { RootProvider } from "client/providers/root-provider";
import { pointsToPolygon } from "shared/polybool/polybool";

const starterPolygon = pointsToPolygon([
	[200, 50],
	[600, 50],
	[600, 150],
	[200, 150],
]);

function DrawingPolygonClipperStoryContent() {
	return (
		<RootProvider>
			<DrawingPolygonClipper starterPolygon={starterPolygon} />
		</RootProvider>
	);
}

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	story: () => <DrawingPolygonClipperStoryContent />,
};

export = story;
