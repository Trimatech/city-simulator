import React from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { useRem } from "client/hooks";
import { HStack } from "client/ui/layout/HStack";
import { VStack } from "client/ui/layout/VStack";
import { POWERUP_PRICES } from "shared/constants/powerups";
import { selectLocalOrbs } from "shared/store/soldiers";

import { BuyButton } from "./BuyButton";
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
		>
			<OrbsMeter anchorPoint={new Vector2(0, 0)} position={new UDim2(0, 0, 0, 0)} heightRem={36} />
			<VStack name="powerups-panel2" size={new UDim2(0, rem(12), 1, 0)}>
				<uigridlayout
					CellPadding={new UDim2(0, rem(1), 0, rem(1))}
					CellSize={new UDim2(0, rem(6), 0, rem(6))}
					FillDirectionMaxCells={2}
					HorizontalAlignment="Center"
					VerticalAlignment="Center"
				/>

				<BuyButton
					id="turbo"
					label="Turbo"
					emoji="⚡"
					anchorPoint={new Vector2(0.5, 0.5)}
					position={new UDim2(0.5, 0, 0, 0)}
					price={POWERUP_PRICES.turbo}
					enabled={orbs >= POWERUP_PRICES.turbo}
				/>

				<BuyButton
					id="shield"
					label="Shield"
					emoji="🛡️"
					anchorPoint={new Vector2(0.5, 0.5)}
					position={new UDim2(0.5, 0, 0, rem(16))}
					price={POWERUP_PRICES.shield}
					enabled={orbs >= POWERUP_PRICES.shield}
				/>
				<BuyButton
					id="tower"
					label="Tower"
					emoji="🗼"
					anchorPoint={new Vector2(0.5, 0.5)}
					position={new UDim2(0.5, 0, 0, rem(24))}
					price={POWERUP_PRICES.tower}
					enabled={orbs >= POWERUP_PRICES.tower}
				/>
				<BuyButton
					id="laserBeam"
					label="Laser"
					emoji="🔆"
					anchorPoint={new Vector2(0.5, 0.5)}
					position={new UDim2(0.5, 0, 0, rem(32))}
					price={POWERUP_PRICES.laserBeam}
					enabled={orbs >= POWERUP_PRICES.laserBeam}
				/>
				<BuyButton
					id="nuclearExplosion"
					label="Nuclear"
					emoji="☢️"
					anchorPoint={new Vector2(0.5, 0.5)}
					position={new UDim2(0.5, 0, 0, rem(40))}
					price={POWERUP_PRICES.nuclearExplosion}
					enabled={orbs >= POWERUP_PRICES.nuclearExplosion}
				/>
			</VStack>
		</HStack>
	);
}
