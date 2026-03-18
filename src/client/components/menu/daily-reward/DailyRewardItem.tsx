import { lerpBinding } from "@rbxts/pretty-react-hooks";
import React, { useBinding, useEffect, useMemo, useRef } from "@rbxts/react";
import { RunService } from "@rbxts/services";
import { ReactiveButton2 } from "@rbxts-ui/components";
import { CanvasGroup, Frame, Image, Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { useMotion } from "client/hooks";
import { Particles } from "client/ui/Particles/Particles";
import { ParticleEmitter2DConfig } from "client/ui/Particles/Particles.interfaces";
import { useRem } from "client/ui/rem/useRem";
import assets from "shared/assets";
import { palette } from "shared/constants/palette";

import { ShopItemTheme, shopItemThemes } from "../shop/ShopItem";

const RAYS_BASE_SPEED = 5;
const RAYS_BURST_SPEED = 90;

const LABEL_COLOR = Color3.fromRGB(250, 222, 77);

const SUBTITLE_STROKE_FROM = Color3.fromHex("#005794");
const SUBTITLE_STROKE_TO = Color3.fromHex("#000000");

interface RotatingRaysProps {
	readonly image: string;
	readonly transparency: number;
	readonly tint: Color3;
	readonly cornerRadius: UDim;
	readonly isActive: boolean;
	readonly speedRef?: { current: number };
}

function RotatingRays({ image, transparency, tint, cornerRadius, isActive, speedRef }: RotatingRaysProps) {
	const [rotation, setRotation] = useBinding(0);

	useEffect(() => {
		if (!isActive) return;
		let angle = 0;
		const connection = RunService.Heartbeat.Connect((dt) => {
			const currentSpeed = speedRef?.current ?? RAYS_BASE_SPEED;
			angle = (angle + dt * currentSpeed) % 360;
			setRotation(angle);
		});
		return () => connection.Disconnect();
	}, []);

	return (
		<CanvasGroup size={new UDim2(1, 0, 1, 0)} backgroundTransparency={1} cornerRadius={cornerRadius} zIndex={1}>
			<Image
				image={image}
				size={new UDim2(1.8, 0, 1.8, 0)}
				position={new UDim2(0.5, 0, 0.5, 0)}
				anchorPoint={new Vector2(0.5, 0.5)}
				imageTransparency={transparency}
				scaleType="Fit"
				imageColor3={tint}
				rotation={rotation}
			>
				<uiaspectratioconstraint AspectRatio={1} />
			</Image>
		</CanvasGroup>
	);
}

interface DailyRewardItemProps {
	readonly title: string;
	readonly label: string;
	readonly icon?: string;
	readonly theme?: ShopItemTheme;
	readonly size?: UDim2;
	readonly layoutOrder?: number;
	readonly isClaimed?: boolean;
	readonly isCurrent?: boolean;
	readonly justClaimed?: boolean;
}

export function DailyRewardItem({
	title,
	label,
	icon,
	theme = shopItemThemes.blue,
	size,
	layoutOrder,
	isClaimed = false,
	isCurrent = false,
	justClaimed = false,
}: DailyRewardItemProps) {
	const rem = useRem();
	const [hover, hoverMotion] = useMotion(0);
	const raysSpeedRef = useRef(RAYS_BASE_SPEED);

	useEffect(() => {
		if (!justClaimed) return;
		raysSpeedRef.current = RAYS_BURST_SPEED;
		const thread = task.delay(1.2, () => {
			raysSpeedRef.current = RAYS_BASE_SPEED;
		});
		return () => task.cancel(thread);
	}, [justClaimed]);

	const crystalBurstConfig = useMemo(
		(): ParticleEmitter2DConfig => ({
			rate: 40,
			lifetime: new NumberRange(0.7, 1.4),
			speed: new NumberRange(80, 260),
			size: new NumberSequence([
				new NumberSequenceKeypoint(0, 28),
				new NumberSequenceKeypoint(0.4, 38),
				new NumberSequenceKeypoint(1, 0),
			]),
			texture: icon ?? assets.ui.crystals.crystals_1,
			acceleration: new NumberRange(0),
			spreadAngle: new NumberRange(-180, 180),
			rotation: new NumberRange(0, 360),
			rotSpeed: new NumberRange(-200, 200),
			transparency: new NumberSequence([
				new NumberSequenceKeypoint(0, 0),
				new NumberSequenceKeypoint(0.65, 0),
				new NumberSequenceKeypoint(1, 1),
			]),
			color: new ColorSequence(new Color3(1, 1, 1)),
			zOffset: 10,
			gravityStrength: 350,
			dragForce: 0.6,
			aspectRatio: 0.65,
		}),
		[icon],
	);

	const baseCardSize = size ?? new UDim2(0, rem(16), 0, rem(24));
	const cardSize = isCurrent ? new UDim2(0, rem(18), 0, rem(26)) : baseCardSize;
	const outerRadius = new UDim(0, rem(1.8));
	const whiteRadius = new UDim(0, rem(1.5));
	const innerRadius = new UDim(0, rem(1.2));
	const gradientSequence = new ColorSequence(theme.gradientFrom, theme.gradientTo);
	const innerBorderGradient = new ColorSequence(theme.innerBorderFrom, theme.innerBorderTo);
	const titleStrokeGradient = new ColorSequence(SUBTITLE_STROKE_FROM, SUBTITLE_STROKE_TO);
	const labelStrokeGradient = new ColorSequence(SUBTITLE_STROKE_FROM, SUBTITLE_STROKE_TO);
	const strokeThickness = rem(0.15);
	const borderPad = new UDim(0, rem(0.3));
	const whitePad = new UDim(0, rem(0.3));

	const iconSize = lerpBinding(hover, new UDim2(0.8, 0, 0.55, 0), new UDim2(0.95, 0, 0.65, 0));

	return (
		<ReactiveButton2
			size={cardSize}
			layoutOrder={layoutOrder}
			backgroundTransparency={1}
			onHover={(hovered) => hoverMotion.spring(hovered ? 1 : 0)}
			name="DailyRewardItem"
		>
			{/* Layer 1: Outer border */}
			<Frame
				backgroundColor={theme.outerBorderColor}
				cornerRadius={outerRadius}
				size={new UDim2(1, 0, 1, 0)}
				backgroundTransparency={0}
			>
				<uipadding
					PaddingTop={borderPad}
					PaddingBottom={borderPad}
					PaddingLeft={borderPad}
					PaddingRight={borderPad}
				/>

				{/* Layer 2: White/cream band */}
				<Frame
					backgroundColor={theme.whiteBorderColor}
					cornerRadius={whiteRadius}
					size={new UDim2(1, 0, 1, 0)}
					backgroundTransparency={0}
				>
					<uipadding
						PaddingTop={whitePad}
						PaddingBottom={whitePad}
						PaddingLeft={whitePad}
						PaddingRight={whitePad}
					/>

					{/* Layer 3: Inner gradient area */}
					<Frame
						backgroundColor={palette.white}
						cornerRadius={innerRadius}
						size={new UDim2(1, 0, 1, 0)}
						backgroundTransparency={0}
						name="DailyRewardItemInner"
						clipsDescendants={true}
					>
						<uistroke Color={palette.white} Thickness={rem(0.15)}>
							<uigradient Color={innerBorderGradient} Rotation={90} />
						</uistroke>
						<uigradient Color={gradientSequence} Rotation={90} />

						{/* Rays texture overlay */}
						<RotatingRays
							image={assets.ui.shop_item_rays}
							transparency={theme.raysTransparency}
							tint={theme.rayTint}
							cornerRadius={innerRadius}
							isActive={isCurrent}
							speedRef={raysSpeedRef}
						/>
						<Image
							image={assets.ui.spot_glow}
							size={new UDim2(1, 0, 1, 0)}
							imageTransparency={theme.raysTransparency}
							zIndex={1}
							scaleType="Fit"
							imageColor3={theme.rayTint}
						/>

						{/* Icon */}
						{icon !== undefined && (
							<Image
								image={icon}
								size={iconSize}
								position={new UDim2(0.5, 0, 0.45, 0)}
								anchorPoint={new Vector2(0.5, 0.5)}
								scaleType="Fit"
								zIndex={2}
							/>
						)}

						{/* Title — "DAY N" */}
						<Text
							text={title}
							font={fonts.fredokaOne.regular}
							textColor={palette.white}
							textSize={rem(2.4)}
							size={new UDim2(1, 0, 0, rem(2.8))}
							position={new UDim2(0, 0, 0.03, 0)}
							textXAlignment="Center"
							textYAlignment="Center"
							zIndex={3}
						>
							<uistroke Thickness={strokeThickness} Color={palette.white}>
								<uigradient Color={titleStrokeGradient} Rotation={90} />
							</uistroke>
						</Text>

						{/* Label — "N Crystal(s)" */}
						<Text
							text={isClaimed ? `<s>${label}</s>` : label}
							richText={isClaimed}
							font={fonts.fredokaOne.regular}
							textColor={LABEL_COLOR}
							textSize={rem(2)}
							size={new UDim2(1, 0, 0, rem(2.4))}
							position={new UDim2(0, 0, 0.85, 0)}
							textXAlignment="Center"
							textYAlignment="Center"
							zIndex={3}
						>
							<uistroke Thickness={strokeThickness} Color={palette.white}>
								<uigradient Color={labelStrokeGradient} Rotation={90} />
							</uistroke>
						</Text>
						{/* Dim overlay for claimed items */}
						{isClaimed && (
							<Frame
								backgroundColor={Color3.fromRGB(79, 0, 194)}
								backgroundTransparency={0.7}
								size={new UDim2(1, 0, 1, 0)}
								cornerRadius={innerRadius}
								zIndex={4}
							/>
						)}
					</Frame>
				</Frame>
			</Frame>

			{/* Crystal particles burst on claim — positioned at icon center, overflows card */}
			{justClaimed && (
				<frame
					Size={new UDim2(0, rem(6), 0, rem(6))}
					Position={new UDim2(0.5, 0, 0.42, 0)}
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					ZIndex={10}
					ClipsDescendants={false}
				>
					<Particles config={crystalBurstConfig} size={new UDim2(1, 0, 1, 0)} emitDuration={0.35} />
				</frame>
			)}
		</ReactiveButton2>
	);
}
