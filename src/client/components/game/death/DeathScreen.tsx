import React, { useEffect, useState } from "@rbxts/react";
import { useSelector, useSelectorCreator } from "@rbxts/react-reflex";
import { ProgressBarTimer } from "client/components/ProgressBarTimer";
import { fonts } from "client/constants/fonts";
import { springs } from "client/constants/springs";
import { useMotion, useRem } from "client/hooks";
import { CanvasGroup } from "client/ui/canvas-group";
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

	// Cache deadline locally so the screen persists even if soldier is removed from store mid-timer
	const [cachedDeadline, setCachedDeadline] = useState<number | undefined>();
	const activeDeadline = cachedDeadline;

	const [isExpired, setIsExpired] = useState(() => {
		if (deathChoiceDeadline === undefined) return false;
		return deathChoiceDeadline - tick() <= 0;
	});

	useEffect(() => {
		if (deathChoiceDeadline !== undefined) {
			setCachedDeadline(deathChoiceDeadline);
			setIsExpired(deathChoiceDeadline - tick() <= 0);
		}
	}, [deathChoiceDeadline]);

	// If soldier is alive (revived), clear cache to hide screen immediately
	useEffect(() => {
		if (soldier && !soldier.dead) {
			setCachedDeadline(undefined);
		}
	}, [soldier, soldier?.dead]);

	const [position, positionMotion] = useMotion(new UDim2(0.5, 0, 2.5, 0));

	useEffect(() => {
		if (activeDeadline !== undefined && !isExpired) {
			positionMotion.set(new UDim2(0.5, 0, 2.5, 0));
			positionMotion.spring(new UDim2(0.5, 0, 0.5, 0), springs.responsive);
		}
	}, [activeDeadline]);

	useEffect(() => {
		if (isExpired) {
			positionMotion.spring(new UDim2(0.5, 0, 2.5, 0), springs.responsive);
			const thread = task.delay(1, () => setCachedDeadline(undefined));
			return () => task.cancel(thread);
		}
	}, [isExpired]);

	if (activeDeadline === undefined) {
		return undefined;
	}

	const [contentSize, setContentSize] = React.createBinding(new Vector2(0, 0));

	const canRevive = crystals >= 1 && !isExpired;

	const smallTextProps = {
		font: fonts.inter.regular,
		textColor: palette.text,
		textSize: rem(1),
		automaticSize: Enum.AutomaticSize.XY,
	};

	return (
		<Frame
			position={position}
			anchorPoint={new Vector2(0.5, 0.5)}
			size={contentSize.map((s) => new UDim2(0, s.X, 0, s.Y))}
			layoutOrder={100}
		>
			{/* Background */}
			<CanvasGroup
				backgroundColor={palette.black}
				backgroundTransparency={0.2}
				size={new UDim2(1, 0, 1, 0)}
				cornerRadius={new UDim(0, rem(2))}
			>
				<Image
					image={assets.ui.diagonal_stripes}
					scaleType="Tile"
					tileSize={new UDim2(0, rem(8), 0, rem(8))}
					imageTransparency={0.85}
					size={new UDim2(1, 0, 1, 0)}
				>
					<uigradient Color={new ColorSequence(palette.red1, palette.black)} Rotation={90} />
				</Image>
			</CanvasGroup>

			<uistroke Color={palette.white} Transparency={0} Thickness={rem(0.5)} />
			<uicorner CornerRadius={new UDim(0, rem(2))} />

			{/* Content */}
			<VStack
				size={new UDim2(0, 0, 0, 0)}
				automaticSize={Enum.AutomaticSize.XY}
				horizontalAlignment={Enum.HorizontalAlignment.Center}
				verticalAlignment={Enum.VerticalAlignment.Center}
				spacing={rem(2)}
				padding={rem(5)}
				change={{ AbsoluteSize: (rbx) => setContentSize(rbx.AbsoluteSize) }}
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
						onClick={() => remotes.soldier.continue.fire()}
						primaryColor={palette.sky}
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
			</VStack>
		</Frame>
	);
}
