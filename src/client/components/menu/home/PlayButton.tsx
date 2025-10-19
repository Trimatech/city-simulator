import React from "@rbxts/react";
import { useMotion } from "client/hooks";
import { AnimatedText } from "client/ui/AnimatedText";
import { PrimaryButton } from "client/ui/PrimaryButton";
import { remotes } from "shared/remotes";

interface PlayButtonProps {
	readonly anchorPoint: Vector2;
	readonly size: UDim2;
	readonly position: UDim2;
}

export function PlayButton({ anchorPoint, size, position }: PlayButtonProps) {
	const [, hoverMotion] = useMotion(0);

	const onClick = () => {
		remotes.soldier.spawn.fire();
	};

	return (
		<PrimaryButton
			onClick={onClick}
			onHover={(hovered) => hoverMotion.spring(hovered ? 1 : 0)}
			anchorPoint={anchorPoint}
			size={size}
			position={position}
		>
			<AnimatedText text="Start Playing →" size={new UDim2(1, 0, 1, 0)} />
		</PrimaryButton>
	);
}
