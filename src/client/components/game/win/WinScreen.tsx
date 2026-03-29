import React, { useEffect, useState } from "@rbxts/react";
import { HStack, VStack } from "@rbxts-ui/layout";
import { Frame, Text } from "@rbxts-ui/primitives";
import { GameWindow } from "client/components/menu/shop/GameWindow";
import { HeaderText } from "client/components/menu/shop/HeaderText";
import { ProgressBarTimer } from "client/components/ProgressBarTimer";
import { fonts } from "client/constants/fonts";
import { springs } from "client/constants/springs";
import { useMotion } from "client/hooks";
import type { WinData } from "client/store/screen";
import { useRem } from "client/ui/rem/useRem";
import assets from "shared/assets";
import { palette } from "shared/constants/palette";

import { WinStatCard } from "./WinStatCard";

const WIN_COUNTDOWN_SEC = 15;

const AVATAR_STROKE_GRADIENT = new ColorSequence(Color3.fromHex("#FFE88C"), Color3.fromHex("#D4A017"));

interface WinScreenProps {
	winData: WinData | undefined;
	onDismiss: () => void;
}

export function WinScreen({ winData, onDismiss }: WinScreenProps) {
	const rem = useRem();

	const [position, positionMotion] = useMotion(new UDim2(0.5, 0, -1.5, 0));
	const [bgTransparency, bgTransparencyMotion] = useMotion(1);
	const [isExpired, setIsExpired] = useState(false);

	useEffect(() => {
		if (winData !== undefined) {
			setIsExpired(false);
			positionMotion.set(new UDim2(0.5, 0, -1.5, 0));
			positionMotion.spring(new UDim2(0.5, 0, 0.5, 0), springs.responsive);
			bgTransparencyMotion.spring(0.3, springs.responsive);
		}
	}, [winData]);

	useEffect(() => {
		if (isExpired) {
			positionMotion.spring(new UDim2(0.5, 0, 2.5, 0), springs.responsive);
			bgTransparencyMotion.spring(1, springs.responsive);
			const thread = task.delay(1, () => onDismiss());
			return () => task.cancel(thread);
		}
	}, [isExpired]);

	if (winData === undefined) {
		return undefined;
	}

	const avatarUrl = `rbxthumb://type=AvatarHeadShot&id=${winData.winnerUserId}&w=150&h=150`;

	return (
		<>
			{/* Dark overlay */}
			<Frame
				name="WinOverlay"
				size={new UDim2(1, 0, 1, 0)}
				backgroundColor={palette.black}
				backgroundTransparency={bgTransparency}
				zIndex={99}
			/>

			{/* Animated wrapper */}
			<Frame
				name="WinScreenAnchor"
				size={new UDim2(1, 0, 1, 0)}
				position={position}
				anchorPoint={new Vector2(0.5, 0.5)}
				backgroundTransparency={1}
				zIndex={100}
			>
				<GameWindow header={<HeaderText text="WORLD DOMINATION" separator=" " />} variant="win-screen">
					<VStack
						spacing={rem(2)}
						padding={rem(2.5)}
						horizontalAlignment={Enum.HorizontalAlignment.Center}
						size={new UDim2(1, 0, 0, 0)}
						automaticSize={Enum.AutomaticSize.Y}
					>
						{/* Avatar with glow */}
						<Frame size={new UDim2(0, rem(10), 0, rem(10))} backgroundTransparency={1}>
							<imagelabel
								Image={assets.ui.spot_glow}
								BackgroundTransparency={1}
								Size={new UDim2(1.8, 0, 1.8, 0)}
								Position={new UDim2(0.5, 0, 0.5, 0)}
								AnchorPoint={new Vector2(0.5, 0.5)}
								ImageColor3={Color3.fromHex("#FFD700")}
								ImageTransparency={0.4}
							/>
							<imagelabel
								Image={avatarUrl}
								BackgroundColor3={Color3.fromHex("#1a1a1a")}
								BackgroundTransparency={0}
								Size={new UDim2(1, 0, 1, 0)}
								Position={new UDim2(0.5, 0, 0.5, 0)}
								AnchorPoint={new Vector2(0.5, 0.5)}
							>
								<uicorner CornerRadius={new UDim(0.5, 0)} />
								<uistroke Color={Color3.fromHex("#FFD700")} Thickness={rem(0.3)}>
									<uigradient Color={AVATAR_STROKE_GRADIENT} Rotation={90} />
								</uistroke>
							</imagelabel>
						</Frame>

						{/* Winner name */}
						<Text
							font={fonts.fredokaOne.regular}
							text={winData.winnerName}
							size={new UDim2(1, 0, 0, 0)}
							automaticSize={Enum.AutomaticSize.Y}
							textColor={palette.white}
							textSize={rem(2.8)}
							textXAlignment="Center"
							layoutOrder={1}
						>
							<uistroke Color={palette.darkBorderColor} Transparency={0} Thickness={rem(0.15)} />
						</Text>

						{/* Stats row */}
						<HStack
							spacing={rem(1)}
							horizontalAlignment={Enum.HorizontalAlignment.Center}
							size={new UDim2(1, 0, 0, 0)}
							automaticSize={Enum.AutomaticSize.Y}
							layoutOrder={2}
						>
							<WinStatCard icon={assets.ui.icons.area} label="Area" value={`${winData.areaPercent}%`} />
							<WinStatCard
								icon={assets.ui.icons.kills}
								label="KOs"
								value={`${winData.eliminations}`}
								layoutOrder={1}
							/>
							<WinStatCard
								icon={assets.ui.shards_icon_color}
								label="Crystals"
								value={`+${winData.crystalsEarned}`}
								layoutOrder={2}
							/>
							<WinStatCard
								icon={assets.ui.shop.Cash}
								label="Cash"
								value={`$${winData.moneyEarned}`}
								layoutOrder={3}
							/>
						</HStack>

						{/* Countdown */}
						<VStack
							spacing={rem(0.5)}
							horizontalAlignment={Enum.HorizontalAlignment.Center}
							size={new UDim2(1, 0, 0, 0)}
							automaticSize={Enum.AutomaticSize.Y}
							layoutOrder={3}
						>
							<Text
								font={fonts.mplus.bold}
								text="New game starting in..."
								size={new UDim2(1, 0, 0, 0)}
								automaticSize={Enum.AutomaticSize.Y}
								textColor={palette.white}
								textSize={rem(1.2)}
								textXAlignment="Center"
								textTransparency={0.3}
							/>
							<Frame
								size={new UDim2(0.7, 0, 0, 0)}
								automaticSize={Enum.AutomaticSize.Y}
								backgroundTransparency={1}
								layoutOrder={1}
							>
								<ProgressBarTimer
									deadlineTime={winData.deadline}
									totalDuration={WIN_COUNTDOWN_SEC}
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
						</VStack>
					</VStack>
				</GameWindow>
			</Frame>
		</>
	);
}
