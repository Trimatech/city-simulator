import React, { useEffect, useState } from "@rbxts/react";
import { useSelectorCreator } from "@rbxts/react-reflex";
import { ProgressBarTimer } from "client/components/ProgressBarTimer";
import { fonts } from "client/constants/fonts";
import { springs } from "client/constants/springs";
import { useMotion, useRem } from "client/hooks";
import { BgWindow } from "client/ui/BgWindow";
import { Image } from "client/ui/image";
import { Frame } from "client/ui/layout/frame";
import { HStack } from "client/ui/layout/HStack";
import { VStack } from "client/ui/layout/VStack";
import { PrimaryButton } from "client/ui/PrimaryButton";
import { Text } from "client/ui/text";
import assets from "shared/assets";
import { DEATH_CHOICE_TIMEOUT_SEC, USER_NAME } from "shared/constants/core";
import { palette } from "shared/constants/palette";
import { remotes } from "shared/remotes";
import { selectPlayerCrystals } from "shared/store/saves";

interface DeathScreenProps {
	activeDeadline: number | undefined;
	onDismiss: () => void;
}

export function DeathScreen({ activeDeadline, onDismiss }: DeathScreenProps) {
	const rem = useRem();
	const crystals = useSelectorCreator(selectPlayerCrystals, USER_NAME) ?? 0;

	const [isReviving, setIsReviving] = useState(false);
	const [isExpired, setIsExpired] = useState(() => {
		if (activeDeadline === undefined) return false;
		return activeDeadline - tick() <= 0;
	});

	useEffect(() => {
		if (activeDeadline !== undefined) {
			setIsExpired(activeDeadline - tick() <= 0);
		}
	}, [activeDeadline]);

	const [position, positionMotion] = useMotion(new UDim2(0.5, 0, 2.5, 0));

	useEffect(() => {
		if (activeDeadline !== undefined && !isExpired) {
			positionMotion.set(new UDim2(0.5, 0, 2.5, 0));
			positionMotion.spring(new UDim2(0.5, 0, 0.5, 0), springs.responsive);
		}
	}, [activeDeadline, isExpired]);

	useEffect(() => {
		if (isExpired || isReviving) {
			positionMotion.spring(new UDim2(0.5, 0, 2.5, 0), springs.responsive);
			const thread = task.delay(1, () => onDismiss());
			return () => task.cancel(thread);
		}
	}, [isExpired, isReviving]);

	if (activeDeadline === undefined) {
		return undefined;
	}

	const canRevive = crystals >= 1 && !isExpired && !isReviving;

	const smallTextProps = {
		font: fonts.inter.regular,
		textColor: palette.text,
		textSize: rem(1),
		automaticSize: Enum.AutomaticSize.XY,
	};

	return (
		<BgWindow
			image={assets.ui.diagonal_stripes}
			accentColor={palette.red}
			secondaryColor={palette.red1}
			position={position}
			layoutOrder={100}
		>
			<Text
				font={fonts.mplus.bold}
				text="You Died"
				automaticSize={Enum.AutomaticSize.XY}
				textColor={palette.red1}
				textSize={rem(6)}
			>
				<uistroke Color={palette.white} Transparency={0} Thickness={rem(0.3)} />
			</Text>

			<VStack
				spacing={rem(1)}
				layoutOrder={1}
				size={new UDim2(1, 0, 0, 0)}
				automaticSize={Enum.AutomaticSize.Y}
				horizontalAlignment={Enum.HorizontalAlignment.Center}
			>
				<Frame size={new UDim2(0, rem(18), 0, rem(0.75))} automaticSize={Enum.AutomaticSize.Y}>
					<ProgressBarTimer
						deadlineTime={activeDeadline!}
						totalDuration={DEATH_CHOICE_TIMEOUT_SEC}
						height={rem(2)}
						onExpired={() => setIsExpired(true)}
						renderOverlay={(secondsLeft) => (
							<Text
								font={fonts.inter.bold}
								text={secondsLeft}
								automaticSize={Enum.AutomaticSize.XY}
								textColor={palette.white}
								textSize={rem(1.5)}
								zIndex={100}
								position={new UDim2(0.5, 0, 0.5, 0)}
								anchorPoint={new Vector2(0.5, 0.5)}
							>
								<uistroke Color={palette.blue1} Transparency={0} Thickness={2} />
							</Text>
						)}
					/>
				</Frame>
				<PrimaryButton
					onClick={() => {
						setIsReviving(true);
						remotes.soldier.continue.fire();
					}}
					primaryColor={palette.sky}
					enabled={canRevive}
					size={new UDim2(0, rem(18), 0, rem(4))}
				>
					<HStack horizontalAlignment={Enum.HorizontalAlignment.Center} automaticSize={Enum.AutomaticSize.XY}>
						<Text
							font={fonts.inter.medium}
							text="Revive"
							textColor={palette.base}
							textSize={rem(2)}
							automaticSize={Enum.AutomaticSize.XY}
						/>

						<Image
							image={assets.ui.shards_icon_color}
							size={new UDim2(0, rem(2), 0, rem(2.5))}
							scaleType="Crop"
						/>
					</HStack>
				</PrimaryButton>
				<HStack horizontalAlignment={Enum.HorizontalAlignment.Center} automaticSize={Enum.AutomaticSize.XY}>
					<uiflexitem FlexMode={Enum.UIFlexMode.Shrink} />
					<Text text={`You have `} {...smallTextProps} />
					<Text
						font={fonts.inter.bold}
						text={`${crystals}`}
						automaticSize={Enum.AutomaticSize.XY}
						textColor={palette.sapphire}
						textSize={rem(1.5)}
					/>
					<Image
						image={assets.ui.shards_icon}
						size={new UDim2(0, rem(1), 0, rem(1.5))}
						imageColor={palette.sapphire}
						scaleType="Crop"
					/>

					<Text text={`left`} {...smallTextProps} />
				</HStack>
			</VStack>
		</BgWindow>
	);
}
