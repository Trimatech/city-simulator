import React, { useEffect, useRef, useState } from "@rbxts/react";
import { HStack, VStack } from "@rbxts-ui/layout";
import { Frame, Image, Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { springs } from "client/constants/springs";
import { useMotion } from "client/hooks";
import { Particles } from "client/ui/Particles/Particles";
import { ParticleEmitter2DConfig } from "client/ui/Particles/Particles.interfaces";
import { useRem } from "client/ui/rem/useRem";
import assets from "shared/assets";
import { formatThreshold, getMilestoneActionText, MilestoneCategoryDef } from "shared/constants/lifetime-milestones";
import { palette } from "shared/constants/palette";

import { MilestoneProgressBar } from "./MilestoneProgressBar";

const BURST_EMIT_DURATION = 0.3;
const BURST_LIFETIME_MAX = 2.2;

const OUTER_BORDER_COLOR = Color3.fromRGB(61, 39, 19);
const OUTER_BORDER_TRANSPARENCY = 0.64;
const OUTER_CORNER = 1;
const INNER_PADDING = 0.1;

const INNER_BG_COLOR = Color3.fromRGB(0, 0, 0);
const INNER_BG_TRANSPARENCY = 0.42;

const INNER_BORDER_GRADIENT = new ColorSequence([
	new ColorSequenceKeypoint(0, Color3.fromHex("#373737")),
	new ColorSequenceKeypoint(1, Color3.fromHex("#000000")),
]);

const PROGRESS_HEIGHT = 0.85;

function getBurstConfig(accent: Color3): ParticleEmitter2DConfig {
	return {
		rate: 60,
		lifetime: new NumberRange(0.6, BURST_LIFETIME_MAX),
		speed: new NumberRange(15, 50),
		size: new NumberSequence([
			new NumberSequenceKeypoint(0, 8),
			new NumberSequenceKeypoint(0.5, 5),
			new NumberSequenceKeypoint(1, 2),
		]),
		texture: assets.ui.icons.orb,
		acceleration: new NumberRange(0),
		spreadAngle: new NumberRange(-45, 45),
		rotation: new NumberRange(-30, 30),
		rotSpeed: new NumberRange(-60, 60),
		transparency: new NumberSequence([
			new NumberSequenceKeypoint(0, 0),
			new NumberSequenceKeypoint(0.5, 0.3),
			new NumberSequenceKeypoint(1, 1),
		]),
		color: new ColorSequence([new ColorSequenceKeypoint(0, accent), new ColorSequenceKeypoint(1, accent)]),
		zOffset: 10,
		gravityStrength: 60,
	};
}

export interface MilestoneItemData {
	readonly category: MilestoneCategoryDef;
	readonly tierName: string;
	readonly current: number;
	readonly target: number;
	readonly ratio: number;
}

interface MilestoneItemProps {
	readonly data: MilestoneItemData;
	readonly celebrating: boolean;
}

export function MilestoneItem({ data, celebrating }: MilestoneItemProps) {
	const rem = useRem();
	const progress = math.clamp(data.current / data.target, 0, 1);
	const accent = Color3.fromHex(data.category.accent);
	const actionText = getMilestoneActionText(data.category, data.target);
	const progressText = `${formatThreshold(data.category, math.min(data.current, data.target))}/${formatThreshold(data.category, data.target)}`;
	const percentText = `${math.floor(progress * 100)}%`;

	const [showBurst, setShowBurst] = useState(false);

	const [glow, glowMotion] = useMotion(0);

	const prevCelebrating = useRef(false);

	useEffect(() => {
		if (celebrating && !prevCelebrating.current) {
			setShowBurst(true);
			glowMotion.spring(1, springs.bubbly);

			task.delay(0.5, () => glowMotion.spring(0, springs.gentle));
			task.delay(BURST_EMIT_DURATION + BURST_LIFETIME_MAX + 0.3, () => setShowBurst(false));
		}
		prevCelebrating.current = celebrating;
	}, [celebrating]);

	const outerCorner = new UDim(0, rem(OUTER_CORNER));

	return (
		<Frame size={new UDim2(1, 0, 0, 0)} backgroundTransparency={1} automaticSize={Enum.AutomaticSize.Y}>
			{/* Outer border frame */}
			<Frame
				backgroundColor={glow.map((g) => INNER_BG_COLOR.Lerp(accent, g * 0.15))}
				backgroundTransparency={glow.map((g) => INNER_BG_TRANSPARENCY - g * 0.2)}
				cornerRadius={outerCorner}
				size={new UDim2(1, 0, 0, 0)}
				automaticSize={Enum.AutomaticSize.Y}
			>
				<uistroke
					Color={glow.map((g) => OUTER_BORDER_COLOR.Lerp(accent, g))}
					Transparency={glow.map((g) => OUTER_BORDER_TRANSPARENCY - g * 0.3)}
					Thickness={rem(0.4)}
				/>
				<uistroke Color={palette.white} Transparency={0.45} Thickness={rem(0.1)}>
					<uigradient Color={INNER_BORDER_GRADIENT} Rotation={90} />
				</uistroke>

				{/* Background pattern */}
				<Image
					image={assets.ui.patterns.dots_pattern}
					imageColor3={palette.white}
					imageTransparency={0.96}
					scaleType="Tile"
					tileSize={new UDim2(0, rem(4), 0, rem(4))}
					size={new UDim2(1, rem(2 * INNER_PADDING), 1, rem(2 * INNER_PADDING))}
					position={new UDim2(0, rem(-INNER_PADDING), 0, rem(-INNER_PADDING))}
				>
					<uicorner CornerRadius={outerCorner} />
				</Image>

				<VStack size={new UDim2(1, 0, 1, 0)} spacing={rem(1)} backgroundTransparency={1} padding={rem(1)}>
					{/* Title row: action text + progress count */}
					<HStack
						size={new UDim2(1, 0, 0, 0)}
						backgroundTransparency={1}
						spacing={rem(0.5)}
						automaticSize={Enum.AutomaticSize.Y}
					>
						<Text
							font={fonts.inter.bold}
							text={actionText}
							textColor={accent}
							textSize={rem(1)}
							textXAlignment="Left"
							textYAlignment="Center"
							backgroundTransparency={1}
							automaticSize={Enum.AutomaticSize.Y}
						>
							<uiflexitem FlexMode={Enum.UIFlexMode.Fill} />
							<uistroke Color={palette.black} Thickness={rem(0.05)} />
						</Text>
						<Text
							font={fonts.inter.bold}
							text={progressText}
							textColor={accent}
							textSize={rem(1)}
							textXAlignment="Right"
							textYAlignment="Center"
							position={new UDim2(0.7, 0, 0, 0)}
							backgroundTransparency={1}
							automaticSize={Enum.AutomaticSize.XY}
						>
							<uistroke Color={palette.black} Thickness={rem(0.05)} />
						</Text>
					</HStack>

					{/* Progress bar */}
					<Frame
						size={new UDim2(1, 0, 0, rem(PROGRESS_HEIGHT))}
						position={new UDim2(0, 0, 1, rem(-PROGRESS_HEIGHT - 0.1))}
						backgroundTransparency={1}
					>
						<MilestoneProgressBar progress={progress} percentText={percentText} color={accent} />
						{/* Particle burst — anchored to the right end of the progress bar */}
						{showBurst && (
							<Frame
								position={new UDim2(1, -rem(0.5), 0, 0)}
								anchorPoint={new Vector2(0.5, 0.5)}
								size={new UDim2(0, 0, 0, 0)}
								backgroundTransparency={1}
								zIndex={20}
							>
								<Particles
									config={getBurstConfig(accent)}
									size={new UDim2(0, rem(1), 0, rem(1))}
									emitDuration={BURST_EMIT_DURATION}
								/>
							</Frame>
						)}
					</Frame>
				</VStack>
			</Frame>
		</Frame>
	);
}
