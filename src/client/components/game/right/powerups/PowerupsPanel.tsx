import React from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { useRem } from "client/hooks";
import { HStack } from "client/ui/layout/HStack";
import { VStack } from "client/ui/layout/VStack";
import { palette } from "shared/constants/palette";
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
	const size = new UDim2(1, 0, 1, 0);
	const orbs = useSelector(selectLocalOrbs) ?? 0;

	return (
		<HStack
			name="powerups-panel"
			anchorPoint={anchorPoint}
			size={size}
			position={position}
			verticalAlignment={Enum.VerticalAlignment.Top}
			spacing={rem(1)}
		>
			<OrbsMeter anchorPoint={new Vector2(0, 0)} position={new UDim2(0, 0, 0, 0)} heightRem={36} />
			<VStack name="powerups-panel2" size={new UDim2(0, rem(12), 1, 0)} spacing={rem(1)}>
				<uigridlayout
					CellPadding={new UDim2(0, rem(1), 0, rem(1))}
					CellSize={new UDim2(0, rem(6), 0, rem(6))}
					FillDirectionMaxCells={2}
					HorizontalAlignment="Center"
					VerticalAlignment="Center"
				/>

				<BuyPowerup
					emoji="⚡"
					label="Turbo"
					primaryColor={palette.flamingo}
					enabled={orbs >= POWERUP_PRICES.turbo}
					order={0}
					price={POWERUP_PRICES.turbo}
				/>

				<BuyPowerup
					label="Shield"
					emoji="🛡️"
					primaryColor={palette.flamingo}
					enabled={orbs >= POWERUP_PRICES.shield}
					order={1}
					price={POWERUP_PRICES.shield}
				/>
				<BuyPowerup
					label="Tower"
					emoji="🗼"
					primaryColor={palette.flamingo}
					enabled={orbs >= POWERUP_PRICES.tower}
					order={2}
					price={POWERUP_PRICES.tower}
				/>
				<BuyPowerup
					label="Laser"
					emoji="🔆"
					primaryColor={palette.flamingo}
					enabled={orbs >= POWERUP_PRICES.laserBeam}
					order={3}
					price={POWERUP_PRICES.laserBeam}
				/>

				<BuyPowerup
					label="Nuclear"
					emoji="☢️"
					primaryColor={palette.flamingo}
					enabled={orbs >= POWERUP_PRICES.nuclearExplosion}
					order={4}
					price={POWERUP_PRICES.nuclearExplosion}
				/>
			</VStack>
		</HStack>
	);
}
