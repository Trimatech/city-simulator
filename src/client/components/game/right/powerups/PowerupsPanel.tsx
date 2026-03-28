import React from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { HStack, VStack } from "@rbxts-ui/layout";
import { useRem } from "client/ui/rem/useRem";
import { POWERUP_PRICES } from "shared/constants/powerups";
import { selectLocalOrbs, selectLocalSoldier } from "shared/store/soldiers";

import { BuyPowerup } from "./BuyPowerup";
import { OrbsMeter } from "./OrbsMeter";
import { ShieldTimer } from "./ShieldTimer";
import { TurboTimer } from "./TurboTimer";

interface Props {
	readonly visible: boolean;
}

export function PowerupsPanel({ visible }: Props) {
	const rem = useRem();
	const height = rem(36);
	const width = rem(8);
	const size = new UDim2(0, width, 0, height);
	const orbs = useSelector(selectLocalOrbs) ?? 0;
	const localSoldier = useSelector(selectLocalSoldier);
	const isInsideTerritory = localSoldier?.isInside ?? false;

	return (
		<HStack
			name="powerups-panel"
			size={size}
			verticalAlignment={Enum.VerticalAlignment.Bottom}
			horizontalAlignment={Enum.HorizontalAlignment.Right}
			spacing={rem(1)}
		>
			<VStack
				name="buy-powerups-stack"
				size={new UDim2(0, 0, 1, 0)}
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
					panelVisible={visible}
				/>

				<BuyPowerup
					id="laserBeam"
					label="Laser"
					enabled={orbs >= POWERUP_PRICES.laserBeam}
					order={2}
					price={POWERUP_PRICES.laserBeam}
					panelVisible={visible}
				/>

				<BuyPowerup
					id="shield"
					label="Shield"
					enabled={orbs >= POWERUP_PRICES.shield}
					order={3}
					price={POWERUP_PRICES.shield}
					panelVisible={visible}
				>
					<ShieldTimer />
				</BuyPowerup>

				<BuyPowerup
					id="tower"
					label="Tower"
					enabled={orbs >= POWERUP_PRICES.tower && isInsideTerritory}
					order={4}
					price={POWERUP_PRICES.tower}
					disabledReason={!isInsideTerritory ? "Can't place" : undefined}
					panelVisible={visible}
				/>

				<BuyPowerup
					id="turbo"
					label="Turbo"
					enabled={orbs >= POWERUP_PRICES.turbo}
					order={5}
					price={POWERUP_PRICES.turbo}
					panelVisible={visible}
				>
					<TurboTimer />
				</BuyPowerup>
			</VStack>
			<OrbsMeter anchorPoint={new Vector2(0, 0)} position={new UDim2(0, 0, 0, 0)} />
		</HStack>
	);
}
