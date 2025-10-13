import React from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { useRem } from "client/hooks";
import { POWERUP_PRICES } from "shared/constants/powerups";
import { selectLocalOrbs } from "shared/store/soldiers";

import { BuyButton } from "./BuyButton";

interface Props {
	readonly anchorPoint: Vector2;
	readonly position: UDim2;
}

export function PowerupsPanel({ anchorPoint, position }: Props) {
	const rem = useRem();
	const size = new UDim2(0, rem(10), 0, rem(20));
	const orbs = useSelector(selectLocalOrbs) ?? 0;

	print("orbs.....", orbs, POWERUP_PRICES.turbo);

	return (
		<frame BackgroundTransparency={1} AnchorPoint={anchorPoint} Size={size} Position={position}>
			<uilistlayout
				Padding={new UDim(0, rem(1))}
				FillDirection="Vertical"
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
				id="turbo2x"
				label="Turbo 2x"
				emoji="⚡⚡"
				anchorPoint={new Vector2(0.5, 0.5)}
				position={new UDim2(0.5, 0, 0, rem(8))}
				price={POWERUP_PRICES.turbo2x}
				enabled={orbs >= POWERUP_PRICES.turbo2x}
			/>
			<BuyButton
				id="shield"
				label="Shield Dome"
				emoji="🛡️"
				anchorPoint={new Vector2(0.5, 0.5)}
				position={new UDim2(0.5, 0, 0, rem(16))}
				price={POWERUP_PRICES.shield}
				enabled={orbs >= POWERUP_PRICES.shield}
			/>
			<BuyButton
				id="tower"
				label="Build Tower"
				emoji="🗼"
				anchorPoint={new Vector2(0.5, 0.5)}
				position={new UDim2(0.5, 0, 0, rem(24))}
				price={POWERUP_PRICES.tower}
				enabled={orbs >= POWERUP_PRICES.tower}
			/>
			<BuyButton
				id="laserBeam"
				label="Laser Beam"
				emoji="🔆"
				anchorPoint={new Vector2(0.5, 0.5)}
				position={new UDim2(0.5, 0, 0, rem(32))}
				price={POWERUP_PRICES.laserBeam}
				enabled={orbs >= POWERUP_PRICES.laserBeam}
			/>
			<BuyButton
				id="nuclearExplosion"
				label="Nuclear Explosion"
				emoji="☢️"
				anchorPoint={new Vector2(0.5, 0.5)}
				position={new UDim2(0.5, 0, 0, rem(40))}
				price={POWERUP_PRICES.nuclearExplosion}
				enabled={orbs >= POWERUP_PRICES.nuclearExplosion}
			/>
		</frame>
	);
}
