import React, { useEffect, useState } from "@rbxts/react";
import { useSelector, useSelectorCreator } from "@rbxts/react-reflex";
import { RunService } from "@rbxts/services";
import { fonts } from "client/constants/fonts";
import { useRem } from "client/hooks";
import { VStack } from "client/ui/layout/VStack";
import { PrimaryButton } from "client/ui/PrimaryButton";
import { Text } from "client/ui/text";
import { USER_NAME } from "shared/constants/core";
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

	useEffect(() => {
		if (deathChoiceDeadline === undefined) {
			setSecondsLeft(0);
			return;
		}
		const update = () => {
			const remaining = math.max(0, deathChoiceDeadline - tick());
			setSecondsLeft(math.ceil(remaining));
		};
		update();
		const connection = RunService.Heartbeat.Connect(update);
		return () => connection.Disconnect();
	}, [deathChoiceDeadline]);

	if (!soldier || !soldier.dead) {
		return undefined;
	}

	const canRevive = crystals >= 1 && secondsLeft > 0;

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
			<uistroke Color={palette.text} Transparency={0.5} Thickness={rem(1)} />
			<Text
				font={fonts.inter.bold}
				text="You Died"
				automaticSize={Enum.AutomaticSize.XY}
				textColor={palette.red}
				textSize={rem(6)}
			/>

			<Text
				font={fonts.inter.regular}
				text={secondsLeft > 0 ? `${secondsLeft}s to decide` : "Time's up"}
				automaticSize={Enum.AutomaticSize.XY}
				textColor={secondsLeft > 0 ? palette.subtext1 : palette.red}
				textSize={rem(1.5)}
			/>
			<VStack
				spacing={rem(1)}
				layoutOrder={1}
				size={new UDim2(1, 0, 0, 0)}
				automaticSize={Enum.AutomaticSize.Y}
				horizontalAlignment={Enum.HorizontalAlignment.Center}
			>
				<PrimaryButton
					onClick={() => remotes.soldier.continue.fire()}
					enabled={canRevive}
					size={new UDim2(0, rem(18), 0, rem(4))}
				>
					<Text
						font={fonts.inter.medium}
						text="Revive (1 crystal)"
						textColor={palette.base}
						textSize={rem(1.6)}
						size={new UDim2(1, 0, 1, 0)}
					/>
				</PrimaryButton>
				<Text
					font={fonts.inter.regular}
					text={`💎 You have ${crystals} crystals`}
					automaticSize={Enum.AutomaticSize.XY}
					textColor={palette.text}
					textSize={rem(1.5)}
				/>
				<PrimaryButton
					onClick={() => remotes.soldier.startOver.fire()}
					primaryColor={palette.red}
					size={new UDim2(0, rem(18), 0, rem(4))}
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
