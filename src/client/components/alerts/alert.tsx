import { composeBindings, lerpBinding, useMountEffect } from "@rbxts/pretty-react-hooks";
import React, { useEffect, useMemo } from "@rbxts/react";
import { useSelectorCreator } from "@rbxts/react-reflex";
import { Outline, ReactiveButton2 } from "@rbxts-ui/components";
import { Frame, Image, Text } from "@rbxts-ui/primitives";
import { dismissAlert } from "client/alerts";
import { fonts } from "client/constants/fonts";
import { springs } from "client/constants/springs";
import { useMotion } from "client/hooks";
import { Alert, selectAlertIndex } from "client/store/alert";
import { useRem } from "client/ui/rem/useRem";
import assets from "shared/assets";
import { playSound } from "shared/assetsFolder";
import { palette } from "shared/constants/palette";
import { brightenIfDark, darken } from "shared/utils/color-utils";
import { mapStrict } from "shared/utils/math-utils";

import { AlertTimer } from "./alert-timer";

interface AlertProps {
	readonly alert: Alert;
	readonly index: number;
}

const MAX_VISIBLE_ALERTS = 5;
const ALERT_WIDTH = 30;
const ALERT_HEIGHT = 4;
const ALERT_PADDING = 1.5;
const LIST_PADDING = 0.75;

export function Alert({ alert, index }: AlertProps) {
	const rem = useRem();
	const visibleIndex = useSelectorCreator(selectAlertIndex, alert.id);

	const [transition, transitionMotion] = useMotion(0);
	const [hover, hoverMotion] = useMotion(0);
	const [size, sizeMotion] = useMotion(new UDim2(0, ALERT_WIDTH / 2, 0, ALERT_HEIGHT / 2));
	const [position, positionMotion] = useMotion(new UDim2(0.5, 0, 0, rem(5)));

	const style = useMemo(() => {
		const highlight = composeBindings(hover, transition, (a, b) => a * b);
		const background = darken(alert.color.Lerp(palette.base, 0.25), 0.8);
		const backgroundSecondary = darken(alert.colorSecondary?.Lerp(palette.base, 0.25) || palette.white, 0.8);
		const message = brightenIfDark(alert.colorMessage || alert.color);

		return { highlight, background, backgroundSecondary, message };
	}, [alert, hover, transition]);

	const hasGradient = alert.colorSecondary !== undefined;

	const updateSize = (textWidth: number) => {
		const width = math.max(textWidth + rem(10), rem(ALERT_WIDTH));
		const height = rem(ALERT_HEIGHT);

		sizeMotion.spring(new UDim2(0, width, 0, height), springs.gentle);
	};

	useEffect(() => {
		transitionMotion.spring(alert.visible ? 1 : 0, springs.gentle);
	}, [alert.visible]);

	useEffect(() => {
		const position = (ALERT_HEIGHT + LIST_PADDING) * index;
		const offset = 5;

		positionMotion.spring(new UDim2(0.5, 0, 0, rem(position + offset)), {
			tension: 180,
			friction: 12,
			mass: mapStrict(index, 0, MAX_VISIBLE_ALERTS, 1, 2),
		});
	}, [index, rem]);

	useEffect(() => {
		// Alerts that are dismissed are still in the list, but are invisible.
		// Do not count them towards the index of this alert to prevent it from
		// being dismissed early.
		if (visibleIndex >= MAX_VISIBLE_ALERTS) {
			dismissAlert(alert.id);
		}
	}, [visibleIndex]);

	useMountEffect(() => {
		playSound(alert.sound ?? assets.sounds.bong_001);
	});

	return (
		<ReactiveButton2
			onClick={() => {
				dismissAlert(alert.id);
				playSound(assets.sounds.alert_dismiss);
			}}
			onHover={(hovered) => hoverMotion.spring(hovered ? 1 : 0, springs.responsive)}
			backgroundTransparency={1}
			anchorPoint={new Vector2(0.5, 0)}
			size={size}
			position={position}
		>
			<Frame
				backgroundColor={hasGradient ? palette.white : style.background}
				backgroundTransparency={lerpBinding(transition, 1, 0.1)}
				cornerRadius={new UDim(0, rem(1))}
				size={new UDim2(1, 0, 1, 0)}
			>
				{hasGradient && <uigradient Color={new ColorSequence(style.background, style.backgroundSecondary)} />}
			</Frame>

			<Frame
				backgroundColor={alert.color}
				backgroundTransparency={lerpBinding(style.highlight, 1, 0.9)}
				cornerRadius={new UDim(0, rem(1))}
				size={new UDim2(1, 0, 1, 0)}
			/>

			<Outline
				innerColor={hasGradient ? palette.white : alert.color}
				innerThickness={rem(0.2)}
				innerTransparency={lerpBinding(transition, 1, 0.75)}
				outerTransparency={lerpBinding(transition, 1, 0.55)}
				outerThickness={rem(0.2)}
				cornerRadius={new UDim(0, rem(1))}
			>
				{hasGradient && <uigradient Color={new ColorSequence(alert.color, alert.colorSecondary)} />}
			</Outline>

			<Text
				font={fonts.inter.regular}
				text={alert.emoji}
				textColor={style.message}
				textTransparency={lerpBinding(transition, 1, 0)}
				textSize={rem(1.75)}
				textXAlignment="Left"
				textYAlignment="Center"
				position={new UDim2(0, rem(ALERT_PADDING), 0.5, 0)}
			/>

			<Text
				richText
				font={fonts.inter.medium}
				text={alert.message}
				textColor={style.message}
				textTransparency={lerpBinding(transition, 1, 0)}
				textSize={rem(1.25)}
				textXAlignment="Left"
				textYAlignment="Center"
				anchorPoint={new Vector2(0, 0.5)}
				size={new UDim2(1, rem(-ALERT_PADDING * 2), 1, 0)}
				position={new UDim2(0, rem(ALERT_PADDING + 3), 0.5, 0)}
				clipsDescendants
				change={{
					TextBounds: (rbx) => updateSize(rbx.TextBounds.X),
				}}
			/>

			<Image
				image={assets.ui.alert_dismiss}
				imageColor3={brightenIfDark(alert.colorSecondary || alert.colorMessage || alert.color)}
				imageTransparency={lerpBinding(transition, 1, 0)}
				anchorPoint={new Vector2(1, 0.5)}
				size={new UDim2(0, rem(1), 0, rem(1))}
				position={new UDim2(1, rem(-ALERT_PADDING), 0.5, 0)}
			/>

			<AlertTimer
				duration={alert.duration}
				color={alert.color}
				colorSecondary={alert.colorSecondary}
				transparency={lerpBinding(transition, 1, 0)}
			/>
		</ReactiveButton2>
	);
}
