import Object from "@rbxts/object-utils";
import React, { useEffect, useMemo } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Outline } from "@rbxts-ui/components";
import { Frame } from "@rbxts-ui/primitives";
import { springs } from "client/constants/springs";
import { useMotion } from "client/hooks";
import { useRem } from "client/ui/rem/useRem";
import { Shadow } from "client/ui/shadow";
import { SOLDIER_MAX_ORBS } from "shared/constants/core";
import { palette } from "shared/constants/palette";
import { POWERUP_COLORS, POWERUP_PRICES, PowerupId } from "shared/constants/powerups";
import { selectLocalOrbs } from "shared/store/soldiers";

const SORTED_THRESHOLDS = (Object.entries(POWERUP_PRICES) as Array<[PowerupId, number]>).sort(([, a], [, b]) => a < b);

interface Props {
	readonly anchorPoint?: Vector2;
	readonly position?: UDim2;
	readonly heightRem?: number;
}

export function OrbsMeter({ position = new UDim2(0, 0, 0, 0) }: Props) {
	const rem = useRem();
	const orbs = useSelector(selectLocalOrbs) ?? 0;

	const progressColor = useMemo(() => {
		let color = palette.blue;
		for (const [id, price] of SORTED_THRESHOLDS) {
			if (orbs >= price) {
				color = POWERUP_COLORS[id];
			}
		}
		return color;
	}, [orbs]);

	const progress = math.clamp(math.max(orbs, 15) / SOLDIER_MAX_ORBS, 0, 1);

	const [progressSize, progressMotion] = useMotion(progress, (value) => new UDim2(1, 0, value, 0));

	useEffect(() => {
		progressMotion.spring(progress, springs.gentle);
	}, [progress]);

	const width = rem(1.5);

	const meterSize = new UDim2(0, width, 1, 0);

	const cornerRadius = new UDim(0, rem(0.75));

	return (
		<Frame backgroundTransparency={1} size={meterSize} position={position}>
			<Shadow shadowSize={rem(2)} shadowBlur={0.2} shadowTransparency={0.75} shadowPosition={rem(0.25)} />

			<Frame
				backgroundColor={palette.white}
				backgroundTransparency={0.2}
				cornerRadius={cornerRadius}
				size={new UDim2(1, 0, 1, 0)}
			>
				<uigradient
					Color={new ColorSequence(palette.mauve, palette.blue)}
					Rotation={90}
					Transparency={new NumberSequence(0.2)}
				/>
			</Frame>

			<Frame
				name="orbs-meter-progress"
				backgroundColor={progressColor}
				backgroundTransparency={0}
				anchorPoint={new Vector2(0, 1)}
				cornerRadius={cornerRadius}
				size={progressSize}
				position={new UDim2(0, 0, 1, 0)}
				clipsDescendants={true}
			>
				<uigradient Color={new ColorSequence(progressColor)} Rotation={90} />
			</Frame>

			{/* Price markers */}
			{Object.values(POWERUP_PRICES).map((price) => {
				const fraction = math.clamp(price / SOLDIER_MAX_ORBS, 0, 1);
				const y = 1 - fraction;
				return (
					<Frame
						key={`price-${price}`}
						backgroundColor={palette.white}
						backgroundTransparency={0}
						size={new UDim2(1, 0, 0, rem(0.1))}
						anchorPoint={new Vector2(0.5, 0.5)}
						position={new UDim2(0.5, 0, y, 0)}
					/>
				);
			})}

			<Outline cornerRadius={cornerRadius} innerTransparency={0} outerTransparency={1} />
		</Frame>
	);
}
