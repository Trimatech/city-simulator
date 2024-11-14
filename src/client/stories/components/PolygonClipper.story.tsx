import "client/app/react-config";

import { hoarcekat } from "@rbxts/pretty-react-hooks";
import React from "@rbxts/react";
import { PolygonClipper } from "client/components/polygon-clipper/PolygonClipper";
import { RootProvider } from "client/providers/root-provider";

export = hoarcekat(() => {
	return (
		<RootProvider>
			<PolygonClipper />
		</RootProvider>
	);
});
