import React, { useEffect } from "@rbxts/react";
import { springs } from "client/constants/springs";
import { useMotion } from "client/hooks";

import { Group } from "./layout/group";

type SlideDirection = "left" | "right" | "bottom";

interface SlideInProps extends React.PropsWithChildren {
	visible: boolean;
	direction: SlideDirection;
}

const HIDDEN_POSITIONS: Record<SlideDirection, UDim2> = {
	left: new UDim2(-0.5, 0, 0, 0),
	right: new UDim2(0.5, 0, 0, 0),
	bottom: new UDim2(0, 0, 0.5, 0),
};

const VISIBLE_POSITION = new UDim2();

export function SlideIn({ visible, direction, children }: SlideInProps) {
	const hidden = HIDDEN_POSITIONS[direction];
	const [position, positionMotion] = useMotion(visible ? VISIBLE_POSITION : hidden);

	useEffect(() => {
		positionMotion.spring(visible ? VISIBLE_POSITION : hidden, springs.gentle);
	}, [visible]);

	return (
		<Group position={position}>
			{children}
		</Group>
	);
}
