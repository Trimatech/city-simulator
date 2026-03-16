import React from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { useDeadlineTimer } from "client/hooks/use-deadline-timer";
import { useRem } from "client/ui/rem/useRem";
import { palette, textStrokeGradient } from "shared/constants/palette";
import { POWERUP_DURATIONS } from "shared/constants/powerups";
import { selectLocalShieldActiveUntil } from "shared/store/soldiers";

export function ShieldTimer() {
	const rem = useRem();
	const shieldActiveUntil = useSelector(selectLocalShieldActiveUntil);
	const isActive = shieldActiveUntil > 0;
	const { secondsLeft } = useDeadlineTimer(shieldActiveUntil, POWERUP_DURATIONS.shield);

	if (!isActive) return undefined;

	return (
		<Text
			position={new UDim2(0, 0, 0, 0)}
			size={new UDim2(1, 0, 1, 0)}
			text={secondsLeft}
			font={fonts.fredokaOne.regular}
			textColor={palette.white}
			textSize={rem(3)}
			textXAlignment="Center"
			textYAlignment="Center"
			zIndex={5}
		>
			<uistroke Thickness={rem(0.1)} Color={palette.white}>
				<uigradient Color={textStrokeGradient} Rotation={90} />
			</uistroke>
		</Text>
	);
}
