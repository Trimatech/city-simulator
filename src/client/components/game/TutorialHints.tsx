import React, { useEffect, useRef, useState } from "@rbxts/react";
import { useSelector, useSelectorCreator } from "@rbxts/react-reflex";
import { RunService } from "@rbxts/services";
import { Button } from "@rbxts-ui/components";
import { Frame, Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { springs } from "client/constants/springs";
import { useMotion } from "client/hooks";
import { useRem } from "client/ui/rem/useRem";
import { TypeWriter } from "client/ui/TypeWriter";
import assets from "shared/assets";
import { USER_NAME } from "shared/constants/core";
import { palette } from "shared/constants/palette";
import { selectPlayerLifetimeGamesPlayed, selectPlayerLifetimeOrbsSpent } from "shared/store/saves/save-selectors";
import { selectLocalSoldier } from "shared/store/soldiers";

const HINT_WIDTH = 450;
const SHOW_DELAY_SECONDS = 4;
const ORBS_HINT_DELAY_SECONDS = 3;
const MAX_GAMES_FOR_HINTS = 3;

const HINT_AREA =
	"Leave your area to claim new ground! Orbs inside will be auto-collected. Tip: don't grab too much at once - if an enemy touches your trail wall, you're eliminated!";
const HINT_ORBS =
	"Use collected orbs for abilities! Check the powerup buttons on the right to activate shields, turbo, lasers and more.";

type HintId = "area" | "orbs";

export function TutorialHints() {
	const rem = useRem();
	const gamesPlayed = useSelectorCreator(selectPlayerLifetimeGamesPlayed, USER_NAME);
	const orbsSpent = useSelectorCreator(selectPlayerLifetimeOrbsSpent, USER_NAME);
	const soldier = useSelector(selectLocalSoldier);

	const dismissedRef = useRef<Record<HintId, boolean>>({ area: false, orbs: false });
	const [activeHint, setActiveHint] = useState<HintId | undefined>(undefined);
	const [transparency, transparencyMotion] = useMotion(1);

	const isNewPlayer = gamesPlayed < MAX_GAMES_FOR_HINTS;
	const isAlive = soldier !== undefined && !soldier.dead;
	const hasLeftArea = soldier !== undefined && !soldier.isInside;
	const hasOrbs = (soldier?.orbs ?? 0) > 0;
	const hasSpentOrbs = orbsSpent > 0;

	// Tip 1: Show area claiming hint after a delay when spawned
	useEffect(() => {
		if (!isNewPlayer || !isAlive || dismissedRef.current.area) return;

		const startTime = os.clock();
		const connection = RunService.Heartbeat.Connect(() => {
			if (os.clock() - startTime >= SHOW_DELAY_SECONDS) {
				setActiveHint("area");
				connection.Disconnect();
			}
		});

		return () => connection.Disconnect();
	}, [isNewPlayer, isAlive]);

	// Auto-dismiss area hint when player leaves their area
	useEffect(() => {
		if (activeHint === "area" && hasLeftArea) {
			dismissedRef.current.area = true;
			setActiveHint(undefined);
		}
	}, [activeHint, hasLeftArea]);

	// Tip 2: Show orbs hint after area hint is dismissed and player has orbs
	useEffect(() => {
		if (!isNewPlayer || !isAlive || dismissedRef.current.orbs || !dismissedRef.current.area || !hasOrbs || hasSpentOrbs)
			return;

		const startTime = os.clock();
		const connection = RunService.Heartbeat.Connect(() => {
			if (os.clock() - startTime >= ORBS_HINT_DELAY_SECONDS) {
				setActiveHint("orbs");
				connection.Disconnect();
			}
		});

		return () => connection.Disconnect();
	}, [isNewPlayer, isAlive, hasOrbs, hasSpentOrbs, dismissedRef.current.area]);

	// Auto-dismiss orbs hint when player spends orbs
	useEffect(() => {
		if (activeHint === "orbs" && hasSpentOrbs) {
			dismissedRef.current.orbs = true;
			setActiveHint(undefined);
		}
	}, [activeHint, hasSpentOrbs]);

	// Hide hints when player dies
	useEffect(() => {
		if (!isAlive) setActiveHint(undefined);
	}, [isAlive]);

	const hintText = activeHint === "area" ? HINT_AREA : activeHint === "orbs" ? HINT_ORBS : undefined;

	// Animate transparency
	useEffect(() => {
		transparencyMotion.spring(hintText !== undefined ? 0 : 1, springs.gentle);
	}, [hintText !== undefined]);

	const dismiss = () => {
		if (activeHint !== undefined) {
			dismissedRef.current[activeHint] = true;
			setActiveHint(undefined);
		}
	};

	if (hintText === undefined) return undefined;

	return (
		<Button
			onClick={dismiss}
			active={true}
			backgroundTransparency={1}
			size={new UDim2(0, rem(HINT_WIDTH, "pixel"), 0, 0)}
			position={new UDim2(0.5, 0, 1, -rem(8))}
			anchorPoint={new Vector2(0.5, 1)}
			automaticSize={Enum.AutomaticSize.Y}
		>
			<Frame
				name="TutorialHint"
				size={UDim2.fromScale(1, 0)}
				automaticSize={Enum.AutomaticSize.Y}
				backgroundColor={palette.black}
				backgroundTransparency={transparency}
			>
				<uicorner CornerRadius={new UDim(0, rem(15, "pixel"))} />
				<uistroke
					Color={palette.yellow}
					Transparency={transparency}
					Thickness={rem(2, "pixel")}
					BorderStrokePosition={Enum.BorderStrokePosition.Inner}
				/>
				<uipadding
					PaddingLeft={new UDim(0, rem(1.5))}
					PaddingRight={new UDim(0, rem(1.5))}
					PaddingTop={new UDim(0, rem(1.25))}
					PaddingBottom={new UDim(0, rem(1.25))}
				/>
				<uilistlayout
					SortOrder={Enum.SortOrder.LayoutOrder}
					Padding={new UDim(0, rem(0.5))}
				/>
				<TypeWriter
					text={hintText}
					textSize={rem(1.8)}
					font={fonts.inter.medium}
					textColor={palette.white}
					textTransparency={transparency}
					textWrapped={true}
					textAutoResize="Y"
					size={UDim2.fromScale(1, 0)}
					lineHeight={1.4}
					layoutOrder={1}
					delayBetweenChars={0.03}
					allowSkip={false}
					typingSound={assets.sounds["generated-004_medium"]}
					typingSoundVolume={0.3}
				/>
				<Text
					text="Tap to dismiss"
					textSize={rem(1.25)}
					font={fonts.inter.regular}
					textColor={palette.subtext0}
					textTransparency={transparency}
					textWrapped={false}
					size={new UDim2(1, 0, 0, rem(1.5))}
					textXAlignment="Right"
					layoutOrder={2}
				/>
			</Frame>
		</Button>
	);
}
