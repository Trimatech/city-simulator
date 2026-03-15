import React from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { HStack, VStack } from "@rbxts-ui/layout";
import { useRem } from "client/ui/rem/useRem";
import { POWERUP_PRICES } from "shared/constants/powerups";
import { selectLocalOrbs } from "shared/store/soldiers";

import { BuyPowerup } from "./BuyPowerup";
import { OrbsMeter } from "./OrbsMeter";

interface Props {
	readonly anchorPoint: Vector2;
	readonly position: UDim2;
}

export function PowerupsPanel({ anchorPoint, position }: Props) {
	const rem = useRem();
	const height = rem(36);
	const width = rem(8);
	const size = new UDim2(0, width, 0, height);
	const orbs = useSelector(selectLocalOrbs) ?? 0;

	return (
		<HStack
			name="powerups-panel"
			anchorPoint={anchorPoint}
			position={position}
			size={size}
			verticalAlignment={Enum.VerticalAlignment.Bottom}
			spacing={rem(1)}
		>
			<VStack
				name="buy-powerups-stack"
				size={new UDim2(0, rem(5), 1, 0)}
				spacing={rem(1)}
				verticalAlignment={Enum.VerticalAlignment.Center}
				horizontalAlignment={Enum.HorizontalAlignment.Right}
			>
				<uipadding PaddingTop={new UDim(0, rem(0.5))} />

				<BuyPowerup
					id="nuclearExplosion"
					label="Nuclear"
					enabled={orbs >= POWERUP_PRICES.nuclearExplosion}
					order={1}
					price={POWERUP_PRICES.nuclearExplosion}
				/>

				<BuyPowerup
					id="laserBeam"
					label="Laser"
					enabled={orbs >= POWERUP_PRICES.laserBeam}
					order={2}
					price={POWERUP_PRICES.laserBeam}
				/>

				<BuyPowerup
					id="shield"
					label="Shield"
					enabled={orbs >= POWERUP_PRICES.shield}
					order={3}
					price={POWERUP_PRICES.shield}
				/>

				<BuyPowerup
					id="tower"
					label="Tower"
					enabled={orbs >= POWERUP_PRICES.tower}
					order={4}
					price={POWERUP_PRICES.tower}
				/>

				<BuyPowerup
					id="turbo"
					label="Turbo"
					enabled={orbs >= POWERUP_PRICES.turbo}
					order={5}
					price={POWERUP_PRICES.turbo}
				/>
			</VStack>
			<OrbsMeter anchorPoint={new Vector2(0, 0)} position={new UDim2(0, 0, 0, 0)} />
		</HStack>
	);
}
