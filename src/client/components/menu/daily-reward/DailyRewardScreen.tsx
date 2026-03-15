import { useEventListener } from "@rbxts/pretty-react-hooks";
import React, { useBinding, useEffect, useRef, useState } from "@rbxts/react";
import { useSelectorCreator } from "@rbxts/react-reflex";
import { RunService, TweenService } from "@rbxts/services";
import { HStack } from "@rbxts-ui/layout";
import { Frame, Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { useRem } from "client/ui/rem/useRem";
import { SCROLLBAR_COLOR, SCROLLBAR_THICKNESS, SCROLLBAR_TRANSPARENCY } from "client/ui/scrollbar.constants";
import assets from "shared/assets";
import { USER_NAME } from "shared/constants/core";
import {
	DAILY_REWARD_CYCLE,
	DAILY_STREAK_WINDOW,
	getDailyRewardAmount,
	SECONDS_PER_DAY,
} from "shared/constants/daily-rewards";
import { remotes } from "shared/remotes";
import { selectPlayerDailyStreak, selectPlayerLastDailyRewardClaim } from "shared/store/saves";

import { MainButton, ShopButtonText, shopItemButtonThemes } from "../../../ui/MainButton";
import { GameWindow } from "../shop/GameWindow";
import { GameWindowTitleHeader } from "../shop/GameWindowTitleHeader";
import { DailyRewardItem } from "./DailyRewardItem";

const TIMER_TEXT_COLOR = Color3.fromRGB(255, 230, 80);
const TIMER_STROKE_FROM = Color3.fromHex("#005794");
const TIMER_STROKE_TO = Color3.fromHex("#000000");

interface DailyRewardScreenProps {
	readonly onDismiss: () => void;
}

/**
 * Maps a crystal reward amount to the appropriate crystal icon asset.
 */
function getCrystalIcon(reward: number): string {
	if (reward <= 1) return assets.ui.crystals.crystals_1;
	if (reward <= 2) return assets.ui.crystals.crystals_2;
	if (reward <= 5) return assets.ui.crystals.crystals_5;
	if (reward <= 7) return assets.ui.crystals.crystals_15;
	return assets.ui.crystals.crystals_25;
}

function formatTimeRemaining(seconds: number): string {
	const h = math.floor(seconds / 3600);
	const m = math.floor((seconds % 3600) / 60);
	const s = math.floor(seconds % 60);
	return `${string.format("%02d", h)}h ${string.format("%02d", m)}m ${string.format("%02d", s)}s`;
}

function ClaimTimerText({ deadlineTime }: { deadlineTime: number }) {
	const rem = useRem();
	const [timerText, setTimerText] = useBinding(formatTimeRemaining(math.max(0, deadlineTime - os.time())));
	const timerStrokeGradient = new ColorSequence(TIMER_STROKE_FROM, TIMER_STROKE_TO);

	useEventListener(RunService.Heartbeat, () => {
		const remaining = math.max(0, deadlineTime - os.time());
		setTimerText(formatTimeRemaining(remaining));
	});

	return (
		<frame AutomaticSize={Enum.AutomaticSize.X} Size={new UDim2(0, 0, 1, 0)} BackgroundTransparency={1}>
			<uipadding PaddingLeft={new UDim(0, rem(1.5))} PaddingRight={new UDim(0, rem(1.5))} />
			<Text
				text={timerText}
				font={fonts.fredokaOne.regular}
				textColor={TIMER_TEXT_COLOR}
				textSize={rem(2.2)}
				size={new UDim2(0, 0, 1, 0)}
				textAutoResize="X"
				textXAlignment="Center"
				textYAlignment="Center"
			>
				<uistroke Thickness={rem(0.15)} Color={TIMER_TEXT_COLOR}>
					<uigradient Color={timerStrokeGradient} Rotation={90} />
				</uistroke>
			</Text>
		</frame>
	);
}

export function DailyRewardScreen({ onDismiss }: DailyRewardScreenProps) {
	const rem = useRem();
	const [claimed, setClaimed] = useState(false);
	const currentStreak = useSelectorCreator(selectPlayerDailyStreak, USER_NAME);
	const lastClaimTime = useSelectorCreator(selectPlayerLastDailyRewardClaim, USER_NAME);

	const now = os.time();
	const elapsed = now - lastClaimTime;
	const streakDay =
		lastClaimTime === 0 || elapsed >= DAILY_STREAK_WINDOW
			? 1
			: elapsed >= SECONDS_PER_DAY
				? (currentStreak % DAILY_REWARD_CYCLE) + 1
				: currentStreak;

	const canClaim = lastClaimTime === 0 || elapsed >= SECONDS_PER_DAY;
	const nextClaimDeadline = lastClaimTime + SECONDS_PER_DAY;

	useEffect(() => {
		if (!claimed) return;

		const scrollFrame = scrollRef.current;
		if (scrollFrame) {
			const padding = rem(1.3);
			const nonCurrentWidth = rem(16);
			const currentWidth = rem(18);
			const spacing = rem(1.5);
			const xStart = padding + (streakDay - 1) * (nonCurrentWidth + spacing);
			const xCenter = xStart + currentWidth / 2;
			const targetX = math.max(0, xCenter - scrollFrame.AbsoluteSize.X / 2);
			const tween = TweenService.Create(
				scrollFrame,
				new TweenInfo(0.5, Enum.EasingStyle.Back, Enum.EasingDirection.Out),
				{ CanvasPosition: new Vector2(targetX, 0) },
			);
			tween.Play();
		}

		const thread = task.delay(1, () => onDismiss());
		return () => task.cancel(thread);
	}, [claimed]);

	const scrollRef = useRef<ScrollingFrame>();

	useEffect(() => {
		const thread = task.defer(() => {
			const scrollFrame = scrollRef.current;
			if (!scrollFrame) return;

			const padding = rem(1.3);
			const nonCurrentWidth = rem(16);
			const currentWidth = rem(18);
			const spacing = rem(1.5);

			const xStart = padding + (streakDay - 1) * (nonCurrentWidth + spacing);
			const xCenter = xStart + currentWidth / 2;
			const viewportWidth = scrollFrame.AbsoluteSize.X;
			const targetX = math.max(0, xCenter - viewportWidth / 2);

			scrollFrame.CanvasPosition = new Vector2(targetX, 0);
		});
		return () => task.cancel(thread);
	}, [streakDay]);

	const handleClaim = () => {
		if (claimed || !canClaim) return;
		setClaimed(true);
		remotes.dailyReward.claim.fire();
	};

	const rewardItems: React.Element[] = [];
	for (let i = 1; i <= DAILY_REWARD_CYCLE; i++) {
		const reward = getDailyRewardAmount(i);
		rewardItems.push(
			<DailyRewardItem
				key={`day-${i}`}
				title={`DAY ${i}`}
				label={reward === 1 ? `${reward} Crystal` : `${reward} Crystals`}
				icon={getCrystalIcon(reward)}
				layoutOrder={i}
				isClaimed={i < streakDay}
				isCurrent={i === streakDay}
				justClaimed={claimed && i === streakDay}
			/>,
		);
	}

	return (
		<GameWindow header={<GameWindowTitleHeader title="DAILY REWARDS" onClose={onDismiss} />}>
			<Frame
				backgroundTransparency={1}
				size={new UDim2(1, 0, 0, 0)}
				automaticSize={Enum.AutomaticSize.Y}
				name="DailyRewardScreenContent"
			>
				<scrollingframe
					ref={scrollRef}
					BackgroundTransparency={1}
					BorderSizePixel={0}
					Size={new UDim2(1, 0, 1, 0)}
					CanvasSize={new UDim2(0, 0, 0, 0)}
					AutomaticCanvasSize={Enum.AutomaticSize.X}
					ScrollBarThickness={rem(SCROLLBAR_THICKNESS)}
					ScrollingDirection={Enum.ScrollingDirection.X}
					ScrollBarImageColor3={SCROLLBAR_COLOR}
					ScrollBarImageTransparency={SCROLLBAR_TRANSPARENCY}
					ClipsDescendants={true}
					AutomaticSize={Enum.AutomaticSize.Y}
				>
					<uipadding PaddingBottom={new UDim(0, rem(6))} />
					<HStack
						spacing={rem(1.5)}
						horizontalAlignment={Enum.HorizontalAlignment.Left}
						size={new UDim2(1, 0, 0, 0)}
						automaticSize={Enum.AutomaticSize.Y}
						layoutOrder={1}
						padding={rem(1.3)}
					>
						{rewardItems}
					</HStack>
				</scrollingframe>
				<Frame
					size={new UDim2(0, 0, 0, 0)}
					position={new UDim2(0.5, 0, 1, -rem(5.7))}
					anchorPoint={new Vector2(0.5, 1)}
					automaticSize={Enum.AutomaticSize.X}
				>
					{canClaim ? (
						<MainButton onClick={handleClaim} size={new UDim2(0, rem(22), 0, rem(4.5))} layoutOrder={2}>
							<ShopButtonText
								text={claimed ? "CLAIMED!" : "CLAIM REWARD"}
								theme={shopItemButtonThemes.claimYellow}
							/>
						</MainButton>
					) : (
						<MainButton size={new UDim2(0, rem(22), 0, rem(4.5))} layoutOrder={2} enabled={false}>
							<ClaimTimerText deadlineTime={nextClaimDeadline} />
						</MainButton>
					)}
				</Frame>
			</Frame>
		</GameWindow>
	);
}
