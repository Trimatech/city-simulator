import React, { useState } from "@rbxts/react";
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
	const [isLoading, setIsLoading] = useState(false);

	const onClick = () => {
		setIsLoading(true);
		remotes.soldier.spawn.fire();
	};

	return (
		<MainButton onClick={onClick} anchorPoint={anchorPoint} size={size} position={position} enabled={!isLoading}>
			<AnimatedText
				font={fonts.fredokaOne.regular}
				textColor={palette.white}
				textSize={rem(2.2)}
				text={isLoading ? "Loading..." : "Start Playing →"}
				size={new UDim2(1, 0, 1, 0)}
			/>
		</MainButton>
	);
}
