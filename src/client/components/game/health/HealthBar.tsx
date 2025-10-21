import React, { useEffect } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { springs } from "client/constants/springs";
import { useMotion, useRem } from "client/hooks";
import { Frame } from "client/ui/layout/frame";
import { Outline } from "client/ui/outline";
import { Shadow } from "client/ui/shadow";
import { palette } from "shared/constants/palette";
import { selectLocalHealth, selectLocalMaxHealth } from "shared/store/soldiers";

const defaultSoldier = {
	health: 100,
	maxHealth: 100,
};

export function HealthBar() {
	const rem = useRem();
	const health = useSelector(selectLocalHealth) ?? 0;
	const maxHealth = useSelector(selectLocalMaxHealth) ?? 0;

	const progress = math.clamp(math.max(health, 15) / maxHealth, 0, 1);

	const [progressSize, progressMotion] = useMotion(progress, (value) => new UDim2(1, 0, value, 0));

	useEffect(() => {
		progressMotion.spring(progress, springs.gentle);
	}, [progress]);

	const width = rem(1.5);

	const meterSize = new UDim2(0, width, 1, 0);

	const cornerRadius = new UDim(0, rem(0.75));

	const badColor = new ColorSequence(palette.red, palette.mauve);
	const goodColor = new ColorSequence(palette.green, palette.blue);

	const gradientColor = progress < 0.3 ? badColor : goodColor;

	return (
		<Frame backgroundTransparency={1} size={meterSize}>
			<Shadow shadowSize={rem(2)} shadowBlur={0.2} shadowTransparency={0.75} shadowPosition={rem(0.25)} />

			<Frame
				backgroundColor={palette.white}
				backgroundTransparency={0.2}
				cornerRadius={cornerRadius}
				size={new UDim2(1, 0, 1, 0)}
			>
				<uigradient Color={gradientColor} Rotation={90} Transparency={new NumberSequence(0.2)} />
			</Frame>

			<Frame
				name="orbs-meter-progress"
				backgroundColor={palette.white}
				backgroundTransparency={0}
				anchorPoint={new Vector2(0, 1)}
				cornerRadius={cornerRadius}
				size={progressSize}
				position={new UDim2(0, 0, 1, 0)}
				clipsDescendants={true}
			>
				<uigradient Color={gradientColor} Rotation={90} />
			</Frame>

			<Outline cornerRadius={cornerRadius} innerTransparency={0} outerTransparency={1} />
		</Frame>
	);
}
