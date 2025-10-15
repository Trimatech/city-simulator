import React from "@rbxts/react";
import { IS_EDIT } from "shared/constants/core";

import { Group } from "./group";

interface LayerProps extends React.PropsWithChildren {
	displayOrder?: number;
	name?: string;
}

export function Layer({ displayOrder, name, children }: LayerProps) {
	return IS_EDIT ? (
		<Group zIndex={displayOrder} name={name}>
			{children}
		</Group>
	) : (
		<screengui key={name} ResetOnSpawn={false} DisplayOrder={displayOrder} IgnoreGuiInset ZIndexBehavior="Sibling">
			{children}
		</screengui>
	);
}
