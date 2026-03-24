import React, { useEffect, useRef, useState } from "@rbxts/react";
import { HStack, Transition, VStack } from "@rbxts-ui/layout";
import { Frame, Image, Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { springs } from "client/constants/springs";
import { useMotion } from "client/hooks";
import { Particles } from "client/ui/Particles/Particles";
import { ParticleEmitter2DConfig } from "client/ui/Particles/Particles.interfaces";
import { useRem } from "client/ui/rem/useRem";
import assets from "shared/assets";
import { palette } from "shared/constants/palette";

const BURST_EMIT_DURATION = 0.4;
const BURST_LIFETIME_MAX = 1.5;
const CELEBRATION_DURATION = 1.8;

function getCelebrationConfig(accent: Color3): ParticleEmitter2DConfig {
	return {
		rate: 80,
		lifetime: new NumberRange(0.8, BURST_LIFETIME_MAX),
		speed: new NumberRange(20, 80),
		size: new NumberSequence([
			new NumberSequenceKeypoint(0, 12),
			new NumberSequenceKeypoint(0.5, 8),
			new NumberSequenceKeypoint(1, 3),
		]),
		texture: assets.ui.heart,
		acceleration: new NumberRange(0),
		spreadAngle: new NumberRange(-180, 180),
		rotation: new NumberRange(-45, 45),
		rotSpeed: new NumberRange(-90, 90),
		transparency: new NumberSequence([
			new NumberSequenceKeypoint(0, 0),
			new NumberSequenceKeypoint(0.6, 0.2),
			new NumberSequenceKeypoint(1, 1),
		]),
		color: new ColorSequence([new ColorSequenceKeypoint(0, accent), new ColorSequenceKeypoint(1, palette.yellow)]),
		zOffset: 10,
		gravityStrength: 100,
	};
}

interface MilestoneCardProps {
	readonly title: string;
	readonly subtitle: string;
	readonly emoji: string;
	readonly accent: Color3;
	readonly accentDark: Color3;
	readonly progress: number;
	readonly progressLabel: string;
	/** When true, plays a celebration animation before showing the card */
	readonly celebrating?: boolean;
}

export function MilestoneCard({
	title,
	subtitle,
	emoji,
	accent,
	accentDark,
	progress,
	progressLabel,
	celebrating,
}: MilestoneCardProps) {
	const rem = useRem();
	const clamped = math.clamp(progress, 0, 1);
	const done = clamped >= 1;

	// Celebration state
	const [showBurst, setShowBurst] = useState(false);
	const [scale, scaleMotion] = useMotion(1);
	const [glow, glowMotion] = useMotion(0);
	const prevCelebrating = useRef(false);

	useEffect(() => {
		if (celebrating && !prevCelebrating.current) {
			// Trigger celebration
			setShowBurst(true);
			scaleMotion.spring(1.06, springs.bubbly);
			glowMotion.spring(1, springs.bubbly);

			task.delay(0.3, () => {
				scaleMotion.spring(1, springs.gentle);
			});
			task.delay(0.6, () => {
				glowMotion.spring(0, springs.gentle);
			});
			task.delay(BURST_EMIT_DURATION + BURST_LIFETIME_MAX + 0.5, () => {
				setShowBurst(false);
			});
		}
		prevCelebrating.current = celebrating ?? false;
	}, [celebrating]);

	return (
		<Frame size={new UDim2(1, 0, 0, rem(6.4))} backgroundTransparency={1} clipsDescendants={false}>
			<Transition
				groupTransparency={scale.map((s) => (s > 1.01 ? 0 : 0))}
				size={scale.map((s) => new UDim2(s, 0, s, 0))}
				position={scale.map((s) => new UDim2((1 - s) / 2, 0, (1 - s) / 2, 0))}
			>
				<Frame
					size={new UDim2(1, 0, 1, 0)}
					backgroundColor={accentDark}
					backgroundTransparency={0.1}
				>
					<uicorner CornerRadius={new UDim(0, rem(1.2))} />
					<uistroke Color={accent} Thickness={rem(0.12)} Transparency={done ? 0 : 0.4} />

					{/* Celebration glow overlay */}
					<Frame
						size={new UDim2(1, 0, 1, 0)}
						backgroundColor={accent}
						backgroundTransparency={glow.map((g) => 1 - g * 0.3)}
						zIndex={0}
					>
						<uicorner CornerRadius={new UDim(0, rem(1.2))} />
					</Frame>

					<Image
						image={assets.ui.patterns.dots_pattern}
						imageColor3={palette.white}
						imageTransparency={0.94}
						scaleType="Tile"
						tileSize={new UDim2(0, rem(3), 0, rem(3))}
						size={new UDim2(1, 0, 1, 0)}
					>
						<uicorner CornerRadius={new UDim(0, rem(1.2))} />
					</Image>

					<VStack size={new UDim2(1, 0, 1, 0)} spacing={rem(0.55)} padding={rem(0.95)}>
						<HStack size={new UDim2(1, 0, 0, rem(2.6))} spacing={rem(0.7)}>
							<Text
								font={fonts.fredokaOne.regular}
								text={emoji}
								textSize={rem(2.1)}
								size={new UDim2(0, rem(2.7), 0, rem(2.4))}
								backgroundTransparency={1}
							/>
							<VStack
								size={new UDim2(1, 0, 1, 0)}
								spacing={rem(0.16)}
								verticalAlignment={Enum.VerticalAlignment.Top}
								horizontalAlignment={Enum.HorizontalAlignment.Left}
							>
								<Text
									font={fonts.fredokaOne.regular}
									text={title}
									textColor={accent}
									textSize={rem(1.18)}
									textXAlignment="Left"
									size={new UDim2(1, 0, 0, rem(1.2))}
									backgroundTransparency={1}
								>
									<uistroke
										Thickness={rem(0.08)}
										Color={Color3.fromHex("#000")}
										Transparency={0.5}
									/>
								</Text>
								<Text
									font={fonts.inter.regular}
									text={subtitle}
									textColor={palette.subtext0}
									textSize={rem(0.9)}
									textXAlignment="Left"
									textYAlignment="Top"
									textWrapped={true}
									size={new UDim2(1, 0, 0, rem(1.45))}
									backgroundTransparency={1}
								/>
							</VStack>
						</HStack>

						<Frame
							size={new UDim2(1, 0, 0, rem(1.4))}
							backgroundColor={Color3.fromHex("#000")}
							backgroundTransparency={0.6}
						>
							<uicorner CornerRadius={new UDim(0, rem(0.7))} />
							<Frame
								size={new UDim2(clamped, 0, 1, 0)}
								backgroundColor={accent}
								backgroundTransparency={0.15}
							>
								<uicorner CornerRadius={new UDim(0, rem(0.7))} />
							</Frame>
							<Text
								font={fonts.inter.bold}
								text={progressLabel}
								textColor={palette.white}
								textSize={rem(0.85)}
								size={new UDim2(1, rem(-1.2), 1, 0)}
								position={new UDim2(0, rem(0.6), 0, 0)}
								textXAlignment="Left"
								backgroundTransparency={1}
							/>
						</Frame>
					</VStack>

					{/* Particle burst on celebration */}
					{showBurst && (
						<Frame
							position={new UDim2(0.5, 0, 0.5, 0)}
							anchorPoint={new Vector2(0.5, 0.5)}
							size={new UDim2(0, 1, 0, 1)}
							backgroundTransparency={1}
							zIndex={20}
						>
							<Particles
								config={getCelebrationConfig(accent)}
								size={new UDim2(0, 1, 0, 1)}
								emitDuration={BURST_EMIT_DURATION}
							/>
						</Frame>
					)}
				</Frame>
			</Transition>
		</Frame>
	);
}
