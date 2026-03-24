import React, { useEffect, useRef, useState } from "@rbxts/react";
import { Transition } from "@rbxts-ui/layout";
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

const BURST_EMIT_DURATION = 0.3;
const BURST_LIFETIME_MAX = 1.2;

const OUTER_BORDER_COLOR = Color3.fromRGB(61, 39, 19);
const OUTER_BORDER_TRANSPARENCY = 0.64;
const OUTER_CORNER = 1;
const INNER_PADDING = 0.2;

const INNER_BG_COLOR = Color3.fromRGB(0, 0, 0);
const INNER_BG_TRANSPARENCY = 0.42;
const INNER_BORDER_COLOR = Color3.fromRGB(55, 55, 55);
const INNER_BORDER_TRANSPARENCY = 0.55;
const INNER_CORNER = 0.8;

const PROGRESS_BG_COLOR = Color3.fromRGB(40, 40, 40);
const PROGRESS_BG_TRANSPARENCY = 0.45;
const PROGRESS_BORDER_COLOR = Color3.fromRGB(119, 119, 119);
const PROGRESS_HEIGHT = 0.85;
const PROGRESS_CORNER = 1;

const CARD_HEIGHT = 4.5;

const GOLD = Color3.fromRGB(246, 197, 78);

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
		texture: assets.ui.heart,
		acceleration: new NumberRange(0),
		spreadAngle: new NumberRange(-180, 180),
		rotation: new NumberRange(-30, 30),
		rotSpeed: new NumberRange(-60, 60),
		transparency: new NumberSequence([
			new NumberSequenceKeypoint(0, 0),
			new NumberSequenceKeypoint(0.5, 0.3),
			new NumberSequenceKeypoint(1, 1),
		]),
		color: new ColorSequence([new ColorSequenceKeypoint(0, accent), new ColorSequenceKeypoint(1, palette.yellow)]),
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
	const [scale, scaleMotion] = useMotion(1);
	const [glow, glowMotion] = useMotion(0);
	const [contentOpacity, contentOpacityMotion] = useMotion(0);
	const prevCelebrating = useRef(false);

	useEffect(() => {
		if (celebrating && !prevCelebrating.current) {
			setShowBurst(true);
			scaleMotion.spring(1.08, springs.bubbly);
			glowMotion.spring(1, springs.bubbly);

			task.delay(0.3, () => scaleMotion.spring(1, springs.gentle));
			task.delay(0.5, () => glowMotion.spring(0, springs.gentle));
			task.delay(BURST_EMIT_DURATION + BURST_LIFETIME_MAX + 0.3, () => setShowBurst(false));
		}
		prevCelebrating.current = celebrating;
	}, [celebrating]);

	useEffect(() => {
		contentOpacityMotion.spring(1, springs.gentle);
	}, []);

	const outerCorner = new UDim(0, rem(OUTER_CORNER));
	const innerCorner = new UDim(0, rem(INNER_CORNER));

	return (
		<Frame size={new UDim2(1, 0, 0, rem(CARD_HEIGHT))} backgroundTransparency={1} clipsDescendants={false}>
			<Transition
				groupTransparency={contentOpacity.map((o) => 1 - o)}
				size={scale.map((s) => new UDim2(s, 0, s, 0))}
				position={scale.map((s) => new UDim2((1 - s) / 2, 0, (1 - s) / 2, 0))}
			>
				{/* Outer border frame */}
				<Frame
					backgroundColor={palette.black}
					backgroundTransparency={1}
					cornerRadius={outerCorner}
					size={new UDim2(1, 0, 1, 0)}
					clipsDescendants
				>
					<uistroke
						Color={OUTER_BORDER_COLOR}
						Transparency={OUTER_BORDER_TRANSPARENCY}
						Thickness={rem(0.2)}
					/>
					<uipadding
						PaddingTop={new UDim(0, rem(INNER_PADDING))}
						PaddingBottom={new UDim(0, rem(INNER_PADDING))}
						PaddingLeft={new UDim(0, rem(INNER_PADDING))}
						PaddingRight={new UDim(0, rem(INNER_PADDING))}
					/>

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

					{/* Inner content frame */}
					<Frame
						backgroundColor={INNER_BG_COLOR}
						backgroundTransparency={INNER_BG_TRANSPARENCY}
						cornerRadius={innerCorner}
						size={new UDim2(1, 0, 1, 0)}
						clipsDescendants
					>
						<uistroke
							Color={INNER_BORDER_COLOR}
							Transparency={INNER_BORDER_TRANSPARENCY}
							Thickness={rem(0.07)}
						/>
						<uipadding
							PaddingLeft={new UDim(0, rem(0.8))}
							PaddingRight={new UDim(0, rem(0.8))}
							PaddingTop={new UDim(0, rem(0.5))}
							PaddingBottom={new UDim(0, rem(0.5))}
						/>

						{/* Glow overlay */}
						<Frame
							size={new UDim2(1, rem(1.6), 1, rem(1))}
							position={new UDim2(0, rem(-0.8), 0, rem(-0.5))}
							backgroundColor={accent}
							backgroundTransparency={glow.map((g) => 1 - g * 0.35)}
							zIndex={0}
						>
							<uicorner CornerRadius={innerCorner} />
						</Frame>

						{/* Title row: action text + progress count */}
						<Frame size={new UDim2(1, 0, 0, rem(1.2))} backgroundTransparency={1}>
							<Text
								font={fonts.inter.bold}
								text={actionText}
								textColor={GOLD}
								textSize={rem(1)}
								textXAlignment="Left"
								textYAlignment="Center"
								size={new UDim2(0.7, 0, 1, 0)}
								backgroundTransparency={1}
							/>
							<Text
								font={fonts.inter.bold}
								text={progressText}
								textColor={GOLD}
								textSize={rem(1)}
								textXAlignment="Right"
								textYAlignment="Center"
								size={new UDim2(0.3, 0, 1, 0)}
								position={new UDim2(0.7, 0, 0, 0)}
								backgroundTransparency={1}
							/>
						</Frame>

						{/* Progress bar */}
						<Frame
							size={new UDim2(1, 0, 0, rem(PROGRESS_HEIGHT))}
							position={new UDim2(0, 0, 1, rem(-PROGRESS_HEIGHT - 0.1))}
							backgroundColor={PROGRESS_BG_COLOR}
							backgroundTransparency={PROGRESS_BG_TRANSPARENCY}
						>
							<uicorner CornerRadius={new UDim(0, rem(PROGRESS_CORNER))} />
							<uistroke Color={PROGRESS_BORDER_COLOR} Thickness={rem(0.07)} />

							{/* Fill */}
							<Frame
								size={new UDim2(progress, 0, 1, 0)}
								backgroundColor={GOLD}
								backgroundTransparency={0}
							>
								<uicorner CornerRadius={new UDim(0, rem(PROGRESS_CORNER))} />
							</Frame>

							{/* Percentage label */}
							<Text
								font={fonts.fredokaOne.regular}
								text={percentText}
								textColor={palette.white}
								textSize={rem(0.7)}
								size={new UDim2(1, 0, 1, 0)}
								backgroundTransparency={1}
							/>
						</Frame>

						{/* Particle burst */}
						{showBurst && (
							<Frame
								position={new UDim2(0.5, 0, 0.5, 0)}
								anchorPoint={new Vector2(0.5, 0.5)}
								size={new UDim2(0, 1, 0, 1)}
								backgroundTransparency={1}
								zIndex={20}
							>
								<Particles
									config={getBurstConfig(accent)}
									size={new UDim2(0, 1, 0, 1)}
									emitDuration={BURST_EMIT_DURATION}
								/>
							</Frame>
						)}
					</Frame>
				</Frame>
			</Transition>
		</Frame>
	);
}
