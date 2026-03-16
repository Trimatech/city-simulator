import React, { useEffect, useState } from "@rbxts/react";
import { useSelectorCreator } from "@rbxts/react-reflex";
import { HStack, VStack } from "@rbxts-ui/layout";
import { Frame, Image, Text } from "@rbxts-ui/primitives";
import { ProgressBarTimer } from "client/components/ProgressBarTimer";
import { fonts } from "client/constants/fonts";
import { springs } from "client/constants/springs";
import { useMotion } from "client/hooks";
import { MainButton, ShopButtonTextWithIcon } from "client/ui/MainButton";
import { useRem } from "client/ui/rem/useRem";
import { Workspace } from "@rbxts/services";
import assets from "shared/assets";
import { DEATH_CHOICE_TIMEOUT_SEC, USER_NAME } from "shared/constants/core";
import { palette } from "shared/constants/palette";
import { remotes } from "shared/remotes";
import { selectPlayerCrystals } from "shared/store/saves";

const WINDOW_OUTER_BORDER = Color3.fromHex("#000000");
const GRADIENT_TOP = Color3.fromHex("#44b3de");
const GRADIENT_BOTTOM = Color3.fromHex("#096db3");

const BORDER_GRADIENT = new ColorSequence([
	new ColorSequenceKeypoint(0, Color3.fromHex("#C1E3FF")),
	new ColorSequenceKeypoint(0.5, Color3.fromHex("#43B9F7")),
	new ColorSequenceKeypoint(1, Color3.fromHex("#326FB6")),
]);

const BG_GRADIENT = new ColorSequence(GRADIENT_TOP, GRADIENT_BOTTOM);

const DARK_BORDER_COLOR = Color3.fromHex("#01253B");
const DARK_BORDER_THICKNESS = 0.2;
const BORDER_THICKNESS = 0.3;

interface DeathScreenProps {
	activeDeadline: number | undefined;
	persistent?: boolean;
	onDismiss: () => void;
}

export function DeathScreen({ activeDeadline, persistent, onDismiss }: DeathScreenProps) {
	const rem = useRem();
	const crystals = useSelectorCreator(selectPlayerCrystals, USER_NAME) ?? 0;

	const effectiveDeadline =
		persistent && activeDeadline !== undefined ? Workspace.GetServerTimeNow() + 9999 : activeDeadline;

	const [isReviving, setIsReviving] = useState(false);
	const [isExpired, setIsExpired] = useState(() => {
		if (effectiveDeadline === undefined) return false;
		const now = Workspace.GetServerTimeNow();
		const expired = effectiveDeadline - now <= 0;
		if (expired) {
			warn(`[Death:DeathScreen] Initial state: already expired! deadline=${effectiveDeadline}, serverTime=${now}`);
		}
		return expired;
	});

	useEffect(() => {
		if (effectiveDeadline !== undefined) {
			const timeLeft = effectiveDeadline - Workspace.GetServerTimeNow();
			const expired = timeLeft <= 0;
			warn(
				`[Death:DeathScreen] effectiveDeadline changed: ${effectiveDeadline}, timeLeft=${timeLeft}s, expired=${expired}`,
			);
			setIsExpired(expired);
		}
	}, [effectiveDeadline]);

	const [position, positionMotion] = useMotion(new UDim2(0.5, 0, 2.5, 0));

	useEffect(() => {
		if (effectiveDeadline !== undefined && !isExpired) {
			warn(`[Death:DeathScreen] Animating IN (deadline=${effectiveDeadline}, isExpired=${isExpired})`);
			positionMotion.set(new UDim2(0.5, 0, 2.5, 0));
			positionMotion.spring(new UDim2(0.5, 0, 0.5, 0), springs.responsive);
		}
	}, [effectiveDeadline, isExpired]);

	useEffect(() => {
		if (isExpired || isReviving) {
			warn(`[Death:DeathScreen] Animating OUT (isExpired=${isExpired}, isReviving=${isReviving})`);
			positionMotion.spring(new UDim2(0.5, 0, 2.5, 0), springs.responsive);
			const thread = task.delay(1, () => {
				warn(`[Death:DeathScreen] Calling onDismiss`);
				onDismiss();
			});
			return () => task.cancel(thread);
		}
	}, [isExpired, isReviving]);

	if (effectiveDeadline === undefined) {
		return undefined;
	}

	const windowRadius = new UDim(0, rem(2.8));

	return (
		<Frame
			name="DeathScreen"
			size={new UDim2(0, rem(28), 0, 0)}
			automaticSize={Enum.AutomaticSize.Y}
			position={position}
			anchorPoint={new Vector2(0.5, 0.5)}
			backgroundColor={WINDOW_OUTER_BORDER}
			backgroundTransparency={0}
			cornerRadius={windowRadius}
			layoutOrder={100}
		>
			{/* Gradient background with cloud texture */}
			<Frame
				backgroundColor={palette.white}
				backgroundTransparency={0}
				size={new UDim2(1, 0, 0, 0)}
				automaticSize={Enum.AutomaticSize.Y}
			>
				<uicorner CornerRadius={windowRadius} />
				<uigradient Color={BG_GRADIENT} Rotation={90} />
				<uistroke
					Color={DARK_BORDER_COLOR}
					Thickness={rem(DARK_BORDER_THICKNESS + BORDER_THICKNESS)}
					ZIndex={1}
					BorderStrokePosition={Enum.BorderStrokePosition.Outer}
				/>
				<uistroke Color={palette.white} Thickness={rem(BORDER_THICKNESS)} ZIndex={2}>
					<uigradient Color={BORDER_GRADIENT} Rotation={90} />
				</uistroke>

				{/* Cloud background image */}
				<imagelabel
					Image={assets.ui.skulls_bg}
					BackgroundTransparency={1}
					Size={new UDim2(1, 0, 1, 0)}
					ScaleType={Enum.ScaleType.Crop}
					ImageTransparency={0.9}
				>
					<uicorner CornerRadius={windowRadius} />
				</imagelabel>

				{/* Content */}
				<VStack
					spacing={rem(2)}
					padding={rem(2)}
					horizontalAlignment={Enum.HorizontalAlignment.Center}
					size={new UDim2(1, 0, 0, 0)}
					automaticSize={Enum.AutomaticSize.Y}
				>
					{/* Heading: "You Died" */}
					<Frame size={new UDim2(1, 0, 0, rem(9))} backgroundTransparency={1}>
						<Text
							font={fonts.fredokaOne.regular}
							text={`<font color="#ffffff">You </font><font color="#ff5050">Died</font>`}
							richText={true}
							size={new UDim2(1, 0, 1, 0)}
							textColor={palette.white}
							textSize={rem(6)}
							textXAlignment="Center"
							textYAlignment="Center"
							zIndex={2}
						>
							<uistroke Color={palette.black} Transparency={0} Thickness={rem(0.2)} />
						</Text>
						<Text
							font={fonts.fredokaOne.regular}
							text={`<font color="#ffffff">You </font><font color="#ff5050">Died</font>`}
							richText={true}
							size={new UDim2(1, 0, 1, 0)}
							textColor={palette.white}
							textSize={rem(6)}
							textXAlignment="Center"
							textYAlignment="Center"
							zIndex={1}
						>
							<uistroke Color={palette.white} Transparency={0} Thickness={rem(0.4)} />
						</Text>
					</Frame>

					{/* Progress bar with timer */}
					{!persistent && (
						<Frame
							size={new UDim2(1, 0, 0, 0)}
							automaticSize={Enum.AutomaticSize.Y}
							backgroundTransparency={1}
							layoutOrder={1}
						>
							<ProgressBarTimer
								deadlineTime={effectiveDeadline!}
								totalDuration={DEATH_CHOICE_TIMEOUT_SEC}
								height={rem(2.2)}
								onExpired={() => setIsExpired(true)}
								renderOverlay={(secondsLeft) => (
									<Text
										font={fonts.mplus.bold}
										text={secondsLeft}
										automaticSize={Enum.AutomaticSize.XY}
										textColor={palette.white}
										textSize={rem(1.6)}
										zIndex={100}
										position={new UDim2(0.5, 0, 0.5, 0)}
										anchorPoint={new Vector2(0.5, 0.5)}
									>
										<uistroke Color={palette.dark} Transparency={0} Thickness={rem(0.1)} />
									</Text>
								)}
							/>
						</Frame>
					)}

					{/* Revive button + crystals left */}
					<VStack
						spacing={rem(0.3)}
						layoutOrder={2}
						size={new UDim2(0, rem(17), 0, 0)}
						automaticSize={Enum.AutomaticSize.Y}
						horizontalAlignment={Enum.HorizontalAlignment.Center}
					>
						<MainButton
							fitContent
							onClick={() => {
								setIsReviving(true);
								remotes.soldier.continue.fire();
							}}
						>
							<ShopButtonTextWithIcon text="Revive" icon={assets.ui.shards_icon_color} />
						</MainButton>

						<HStack
							horizontalAlignment={Enum.HorizontalAlignment.Center}
							automaticSize={Enum.AutomaticSize.XY}
							layoutOrder={1}
						>
							<uiflexitem FlexMode={Enum.UIFlexMode.Shrink} />
							<Text
								text="You have "
								font={fonts.fredokaOne.regular}
								textColor={palette.white}
								textSize={rem(1)}
								automaticSize={Enum.AutomaticSize.XY}
							/>
							<Text
								font={fonts.fredokaOne.regular}
								text={`${crystals}`}
								automaticSize={Enum.AutomaticSize.XY}
								textColor={palette.sapphire}
								textSize={rem(1.2)}
							/>
							<Image
								image={assets.ui.shards_icon}
								size={new UDim2(0, rem(1), 0, rem(1.2))}
								imageColor3={palette.sapphire}
								scaleType="Crop"
							/>
							<Text
								text="left"
								font={fonts.fredokaOne.regular}
								textColor={palette.white}
								textSize={rem(1)}
								automaticSize={Enum.AutomaticSize.XY}
							/>
						</HStack>
					</VStack>
				</VStack>
			</Frame>
		</Frame>
	);
}
