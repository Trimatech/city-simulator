import "client/app/react-config";

import React, { useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { ErrorHandler } from "client/components/error-handler";
import { RootProvider } from "client/providers/root-provider";

function BadComponent() {
	useEffect(() => {
		throw "Bad component!";
	}, []);

	return <frame />;
}

function ErrorStoryContent() {
	return (
		<RootProvider>
			<ErrorHandler>
				<BadComponent />
			</ErrorHandler>
		</RootProvider>
	);
}

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	story: () => <ErrorStoryContent />,
};

export = story;
