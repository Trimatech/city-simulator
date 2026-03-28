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

export function PowerupsPanelHorizontal({ visible }: Props) {
	const rem = useRem();
	const orbs = useSelector(selectLocalOrbs) ?? 0;
	const localSoldier = useSelector(selectLocalSoldier);
	const isInsideTerritory = localSoldier?.isInside ?? false;

	const width = rem(28);
	const height = rem(7);
	const size = new UDim2(0, width, 0, height);

	return (
		<VStack
			name="powerups-panel-horizontal"
			size={size}
			spacing={rem(1)}
			horizontalAlignment={Enum.HorizontalAlignment.Center}
			automaticSize={Enum.AutomaticSize.Y}
		>
			<HStack
				name="buy-powerups-stack"
				size={new UDim2(1, 0, 0, rem(5))}
				spacing={rem(1)}
				verticalAlignment={Enum.VerticalAlignment.Center}
				horizontalAlignment={Enum.HorizontalAlignment.Center}
			>
				<BuyPowerup
					id="nuclearExplosion"
					label="Nuclear"
					enabled={orbs >= POWERUP_PRICES.nuclearExplosion}
					order={5}
					price={POWERUP_PRICES.nuclearExplosion}
					panelVisible={visible}
					expandDirection="top"
				/>

				<BuyPowerup
					id="laserBeam"
					label="Laser"
					enabled={orbs >= POWERUP_PRICES.laserBeam}
					order={4}
					price={POWERUP_PRICES.laserBeam}
					panelVisible={visible}
					expandDirection="top"
				/>

				<BuyPowerup
					id="shield"
					label="Shield"
					enabled={orbs >= POWERUP_PRICES.shield}
					order={3}
					price={POWERUP_PRICES.shield}
					panelVisible={visible}
					expandDirection="top"
				>
					<ShieldTimer />
				</BuyPowerup>

				<BuyPowerup
					id="tower"
					label="Tower"
					enabled={orbs >= POWERUP_PRICES.tower && isInsideTerritory}
					order={2}
					price={POWERUP_PRICES.tower}
					disabledReason={!isInsideTerritory ? "Can't place" : undefined}
					panelVisible={visible}
					expandDirection="top"
				/>

				<BuyPowerup
					id="turbo"
					label="Turbo"
					enabled={orbs >= POWERUP_PRICES.turbo}
					order={1}
					price={POWERUP_PRICES.turbo}
					panelVisible={visible}
					expandDirection="top"
				>
					<TurboTimer />
				</BuyPowerup>
			</HStack>
			<OrbsMeter orientation="horizontal" />
		</VStack>
	);
}
