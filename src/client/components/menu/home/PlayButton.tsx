import React from "@rbxts/react";
import { fonts } from "client/constants/fonts";
import { AnimatedText } from "client/ui/AnimatedText";
import { MainButton } from "client/ui/MainButton";
import { useRem } from "client/ui/rem/useRem";
import { palette } from "shared/constants/palette";
import { remotes } from "shared/remotes";

interface PlayButtonProps {
	readonly anchorPoint: Vector2;
	readonly size: UDim2;
	readonly position: UDim2;
}

export function PlayButton({ anchorPoint, size, position }: PlayButtonProps) {
	const rem = useRem();
	const onClick = () => {
		remotes.soldier.spawn.fire();
	};

	return (
		<MainButton onClick={onClick} anchorPoint={anchorPoint} size={size} position={position}>
			<AnimatedText
				font={fonts.fredokaOne.regular}
				textColor={palette.white}
				textSize={rem(2.2)}
				text="Start Playing →"
				size={new UDim2(1, 0, 1, 0)}
			/>
		</MainButton>
	);
}
