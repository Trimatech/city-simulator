import React from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { useRem } from "client/hooks";
import { HStack } from "client/ui/layout/HStack";
import { VStack } from "client/ui/layout/VStack";
import { POWERUP_COLORS, POWERUP_PRICES } from "shared/constants/powerups";
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
	const width = rem(20);
	const size = new UDim2(0, width, 0, height);
	const orbs = useSelector(selectLocalOrbs) ?? 0;

	return (
		<HStack
			name="powerups-panel"
			anchorPoint={anchorPoint}
			position={position}
			size={size}
			verticalAlignment={Enum.VerticalAlignment.Top}
			spacing={rem(1)}
		>
			<VStack
				name="buy-powerups-stack"
				size={new UDim2(0, rem(12), 1, 0)}
				spacing={rem(1)}
				anchorPoint={new Vector2(1, 0.5)}
				horizontalAlignment={Enum.HorizontalAlignment.Right}
			>
				<uigridlayout
					CellPadding={new UDim2(0, rem(1), 0, rem(1))}
					CellSize={new UDim2(0, rem(6), 0, rem(6))}
					FillDirectionMaxCells={2}
					HorizontalAlignment="Right"
					VerticalAlignment="Center"
					SortOrder={Enum.SortOrder.LayoutOrder}
				/>
				<BuyPowerup
					id="nuclearExplosion"
					label="Nuclear"
					emoji="☢️"
					primaryColor={POWERUP_COLORS.nuclearExplosion}
					enabled={orbs >= POWERUP_PRICES.nuclearExplosion}
					order={1}
					price={POWERUP_PRICES.nuclearExplosion}
				/>

				<BuyPowerup
					id="laserBeam"
					label="Laser"
					emoji="🔫"
					primaryColor={POWERUP_COLORS.laserBeam}
					enabled={orbs >= POWERUP_PRICES.laserBeam}
					order={2}
					price={POWERUP_PRICES.laserBeam}
				/>
				<BuyPowerup
					id="shield"
					label="Shield"
					emoji="🛡️"
					primaryColor={POWERUP_COLORS.shield}
					enabled={orbs >= POWERUP_PRICES.shield}
					order={3}
					price={POWERUP_PRICES.shield}
				/>

				<BuyPowerup
					id="tower"
					label="Tower"
					emoji="🗼"
					primaryColor={POWERUP_COLORS.tower}
					enabled={orbs >= POWERUP_PRICES.tower}
					order={4}
					price={POWERUP_PRICES.tower}
				/>

				<BuyPowerup
					id="turbo"
					emoji="⚡"
					label="Turbo"
					primaryColor={POWERUP_COLORS.turbo}
					enabled={orbs >= POWERUP_PRICES.turbo}
					order={5}
					price={POWERUP_PRICES.turbo}
				/>
			</VStack>
			<OrbsMeter anchorPoint={new Vector2(0, 0)} position={new UDim2(0, 0, 0, 0)} />
		</HStack>
	);
}
