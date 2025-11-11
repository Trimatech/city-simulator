import "client/app/react-config";

import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { PolygonClipper } from "client/components/polygon-clipper/PolygonClipper";
import { RootProvider } from "client/providers/root-provider";

function PolygonClipperStoryContent() {
	return (
		<RootProvider>
			<PolygonClipper />
		</RootProvider>
	);
}

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	story: () => <PolygonClipperStoryContent />,
};

export = story;
