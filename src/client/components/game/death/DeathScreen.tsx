import React, { useEffect, useState } from "@rbxts/react";
import { useSelector, useSelectorCreator } from "@rbxts/react-reflex";
import { RunService } from "@rbxts/services";
import { ProgressBar } from "client/components/ProgressBar";
import { fonts } from "client/constants/fonts";
import { useRem } from "client/hooks";
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
import { selectLocalDeathChoiceDeadline, selectLocalSoldier } from "shared/store/soldiers";

export function DeathScreen() {
	const rem = useRem();
	const soldier = useSelector(selectLocalSoldier);
	const deathChoiceDeadline = useSelector(selectLocalDeathChoiceDeadline);
	const crystals = useSelectorCreator(selectPlayerCrystals, USER_NAME) ?? 0;

	const [secondsLeft, setSecondsLeft] = useState(0);
	const [remainingSeconds, setRemainingSeconds] = useState(0);

	useEffect(() => {
		if (deathChoiceDeadline === undefined) {
			setSecondsLeft(0);
			setRemainingSeconds(0);
			return;
		}
		const update = () => {
			const remaining = math.max(0, deathChoiceDeadline - tick());
			setSecondsLeft(math.ceil(remaining));
			setRemainingSeconds(remaining);
		};
		update();
		const connection = RunService.Heartbeat.Connect(update);
		return () => connection.Disconnect();
	}, [deathChoiceDeadline]);

	if (!soldier || !soldier.dead) {
		return undefined;
	}

	const canRevive = crystals >= 1 && secondsLeft > 0;

	const smallTextProps = {
		font: fonts.inter.regular,
		textColor: palette.text,
		textSize: rem(1),
		automaticSize: Enum.AutomaticSize.XY,
	};

	const isTimerActive = secondsLeft > 0;

	return (
		<VStack
			backgroundColor={palette.black}
			backgroundTransparency={0.5}
			position={new UDim2(0.5, 0, 0.5, 0)}
			anchorPoint={new Vector2(0.5, 0.5)}
			size={new UDim2(0, 0, 0, 0)}
			automaticSize={Enum.AutomaticSize.XY}
			horizontalAlignment={Enum.HorizontalAlignment.Center}
			verticalAlignment={Enum.VerticalAlignment.Center}
			spacing={rem(2)}
			padding={rem(5)}
			layoutOrder={100}
		>
			<uicorner CornerRadius={new UDim(0, rem(2))} />
			<uistroke Color={palette.white} Transparency={0} Thickness={rem(0.5)} />
			<Text
				font={fonts.inter.bold}
				text="You Died"
				automaticSize={Enum.AutomaticSize.XY}
				textColor={palette.red}
				textSize={rem(6)}
			/>

			<VStack
				spacing={rem(1)}
				layoutOrder={1}
				size={new UDim2(1, 0, 0, 0)}
				automaticSize={Enum.AutomaticSize.Y}
				horizontalAlignment={Enum.HorizontalAlignment.Center}
			>
				{isTimerActive && (
					<VStack
						spacing={rem(1)}
						size={new UDim2(1, 0, 0, 0)}
						automaticSize={Enum.AutomaticSize.Y}
						horizontalAlignment={Enum.HorizontalAlignment.Center}
					>
						<Frame size={new UDim2(0, rem(18), 0, rem(0.75))} automaticSize={Enum.AutomaticSize.Y}>
							<Text
								font={fonts.inter.bold}
								text={`${secondsLeft}`}
								automaticSize={Enum.AutomaticSize.XY}
								textColor={palette.white}
								textSize={rem(1.5)}
								zIndex={100}
								position={new UDim2(0.5, 0, 0.5, 0)}
								anchorPoint={new Vector2(0.5, 0.5)}
							>
								<uistroke Color={palette.blue1} Transparency={0} Thickness={2} />
							</Text>
							<ProgressBar current={remainingSeconds} target={DEATH_CHOICE_TIMEOUT_SEC} height={rem(2)} />
						</Frame>
						<PrimaryButton
							onClick={() => remotes.soldier.continue.fire()}
							enabled={canRevive}
							size={new UDim2(0, rem(18), 0, rem(4))}
						>
							<HStack
								horizontalAlignment={Enum.HorizontalAlignment.Center}
								automaticSize={Enum.AutomaticSize.XY}
							>
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
						<HStack
							horizontalAlignment={Enum.HorizontalAlignment.Center}
							automaticSize={Enum.AutomaticSize.XY}
						>
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
				)}

				<PrimaryButton
					onClick={() => remotes.soldier.startOver.fire()}
					primaryColor={palette.red}
					size={new UDim2(0, rem(isTimerActive ? 9 : 18), 0, rem(isTimerActive ? 3 : 4))}
					layoutOrder={3}
				>
					<Text
						font={fonts.inter.medium}
						text="Start Over"
						textColor={palette.base}
						textSize={rem(1.6)}
						size={new UDim2(1, 0, 1, 0)}
					/>
				</PrimaryButton>
			</VStack>
		</VStack>
	);
}
