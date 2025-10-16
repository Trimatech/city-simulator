import React from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { useRem } from "client/hooks";
import { Frame } from "client/ui/layout/frame";
import { Outline } from "client/ui/outline";
import { Shadow } from "client/ui/shadow";
import { SOLDIER_MAX_ORBS } from "shared/constants/core";
import { palette } from "shared/constants/palette";
import { selectLocalOrbs } from "shared/store/soldiers";

interface Props {
	readonly anchorPoint?: Vector2;
	readonly position?: UDim2;
	readonly heightRem?: number;
}

export function OrbsMeter({ position = new UDim2(0, 0, 0, 0), heightRem = 48 }: Props) {
	const rem = useRem();
	const orbs = useSelector(selectLocalOrbs) ?? 0;

	const progress = math.clamp(math.max(orbs, 15) / SOLDIER_MAX_ORBS, 0, 1);

	const width = rem(1.5);
	const height = rem(heightRem);

	const meterSize = new UDim2(0, width, 0, height);

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
				backgroundColor={palette.red}
				backgroundTransparency={0}
				anchorPoint={new Vector2(0, 1)}
				cornerRadius={cornerRadius}
				size={new UDim2(1, 0, progress, 0)}
				position={new UDim2(0, 0, 1, 0)}
				clipsDescendants={true}
			>
				<uigradient Color={new ColorSequence(palette.mauve, palette.blue)} Rotation={90} />
			</Frame>

			<Outline cornerRadius={cornerRadius} innerTransparency={0} />
		</Frame>
	);
}
