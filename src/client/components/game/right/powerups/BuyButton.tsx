import { lerpBinding, useTimer } from "@rbxts/pretty-react-hooks";
import React from "@rbxts/react";
import { Outline } from "@rbxts-ui/components";
import { Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { useMotion } from "client/hooks";
import { MainButton } from "client/ui/MainButton";
import { useRem } from "client/ui/rem/useRem";
import { Shadow } from "client/ui/shadow";
import { palette } from "shared/constants/palette";
import { PowerupId } from "shared/constants/powerups";
import { remotes } from "shared/remotes";

export function BuyButton({
	id,
	label,
	emoji,
	anchorPoint,
	position,
	price,
	enabled,
}: {
	id: PowerupId;
	label: string;
	emoji: string;
	anchorPoint: Vector2;
	position: UDim2;
	price: number;
	enabled?: boolean;
}) {
	const rem = useRem();
	const timer = useTimer();
	const [hover, hoverMotion] = useMotion(0);

	const gradientSpin = timer.value.map((t) => 30 * t);

	const onClick = () => remotes.powerups.use.fire(id);

	const size = new UDim2(0, rem(7), 0, rem(7));

	return (
		<MainButton
			onClick={onClick}
			onHover={(h) => hoverMotion.spring(h ? 1 : 0)}
			overlayGradient={
				enabled ? new ColorSequence(palette.mauve, palette.blue) : new ColorSequence(palette.mauve, palette.red)
			}
			anchorPoint={anchorPoint}
			size={size}
			position={position}
		>
			<Shadow
				shadowColor={palette.white}
				shadowTransparency={lerpBinding(hover, 0.2, 0)}
				shadowSize={rem(1.5)}
				shadowPosition={rem(0.25)}
				zIndex={0}
			>
				<uigradient Rotation={gradientSpin} />
			</Shadow>
			<Text
				text={emoji}
				textSize={rem(3)}
				size={new UDim2(1, 0, 0.6, 0)}
				textYAlignment="Center"
				textTransparency={enabled ? 0 : 0.5}
			/>
			<Text
				font={fonts.inter.medium}
				text={label}
				textColor={palette.mantle}
				textSize={rem(1.25)}
				size={new UDim2(1, 0, 0.2, 0)}
				position={new UDim2(0, 0, 0.6, 0)}
				textYAlignment="Center"
				textTransparency={enabled ? 0 : 0.5}
			/>
			<Text
				text={`🔮 ${price}`}
				textSize={rem(1)}
				size={new UDim2(1, 0, 0.2, 0)}
				position={new UDim2(0, 0, 0.8, 0)}
				textYAlignment="Center"
				textTransparency={enabled ? 0 : 0.5}
			/>
			<Outline cornerRadius={new UDim(0, rem(1))} innerTransparency={0} />
		</MainButton>
	);
}
