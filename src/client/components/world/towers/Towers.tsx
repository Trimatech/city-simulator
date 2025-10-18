import Object from "@rbxts/object-utils";
import React, { useEffect, useRef } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Workspace } from "@rbxts/services";
import { selectTowersById } from "shared/store/towers/tower-selectors";

import { Tower } from "./Tower";

// This component manages rendering all towers
export function Towers() {
	const towers = useSelector(selectTowersById);

	const parentRef = useRef<Folder>();

	useEffect(() => {
		// Create towers folder if it doesn't exist
		parentRef.current = Workspace.FindFirstChild("Towers") as Folder;
		if (!parentRef.current) {
			const towersFolder = new Instance("Folder");
			towersFolder.Name = "Towers";
			towersFolder.Parent = Workspace;
			parentRef.current = towersFolder;
		}

		return () => {
			// Cleanup towers folder on unmount
			//	parent?.Destroy();
		};
	}, []);

	return (
		<>
			{Object.values(towers).map((tower) => {
				return <Tower key={tower.id} towerId={tower.id} parentFolder={parentRef.current} />;
			})}
		</>
	);
}
