import { useEventListener, useLatest } from "@rbxts/pretty-react-hooks";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "@rbxts/react";
import { UserInputService } from "@rbxts/services";
import { TextProps } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { playSound } from "shared/assetsFolder";

import { useRem } from "./rem/useRem";

export interface TypeWriterProps extends Omit<TextProps, "maxVisibleGraphemes" | "text"> {
	/**
	 * The text to display with typewriter effect
	 */
	text: string;
	/**
	 * Delay between characters in seconds (default: 0.03)
	 */
	delayBetweenChars?: number;
	/**
	 * Whether to allow skipping the animation with mouse click or space key (default: true)
	 */
	allowSkip?: boolean;
	/**
	 * Callback when typewriter animation completes
	 */
	onComplete?: () => void;
	/**
	 * Callback when typewriter animation is skipped
	 */
	onSkip?: () => void;
	/**
	 * Sound asset ID to loop while typing. Stops when animation completes or is skipped.
	 */
	typingSound?: string;
	/**
	 * Volume for the typing sound (default: 0.3)
	 */
	typingSoundVolume?: number;
}

export function TypeWriter(props: TypeWriterProps) {
	const {
		text,
		delayBetweenChars = 0.03,
		allowSkip = true,
		onComplete,
		onSkip,
		typingSound,
		typingSoundVolume = 0.3,
		padding,
		name,
		font,
		textColor,
		textSize,
		textTransparency,
		textWrapped,
		textXAlignment,
		textYAlignment,
		textTruncate,
		textScaled,
		textHeight,
		textAutoResize,
		richText,
		selectable,
		lineHeight,
		size,
		position,
		anchorPoint,
		backgroundColor,
		backgroundTransparency,
		clipsDescendants,
		visible,
		zIndex,
		layoutOrder,
		change,
		event,
		cornerRadius,
		children,
	} = props;

	const rem = useRem();
	const textLabelRef = useRef<TextLabel>();
	const [maxVisibleGraphemes, setMaxVisibleGraphemes] = useState(0);
	const [isComplete, setIsComplete] = useState(false);
	const cancelledRef = useRef(false);
	const threadRef = useRef<thread | undefined>();

	// Use refs for values that change to avoid stale closures
	const allowSkipRef = useLatest(allowSkip);
	const isCompleteRef = useLatest(isComplete);
	const textRef = useLatest(text);
	const onSkipRef = useLatest(onSkip);

	const skipAnimation = useCallback(() => {
		if (!textLabelRef.current || isCompleteRef.current) {
			return;
		}

		cancelledRef.current = true;
		if (threadRef.current) {
			task.cancel(threadRef.current);
		}

		// Count total graphemes and show all immediately
		let totalGraphemes = 0;
		for (const [,] of utf8.graphemes(textRef.current)) {
			totalGraphemes++;
		}

		setMaxVisibleGraphemes(totalGraphemes);
		setIsComplete(true);
		onSkipRef.current?.();
	}, [isCompleteRef, textRef, onSkipRef]);

	// Listen for mouse clicks and space key press
	useEventListener(UserInputService.InputBegan, (input: InputObject, gameProcessed: boolean) => {
		if (!allowSkipRef.current || gameProcessed || isCompleteRef.current) {
			return;
		}

		// Handle mouse clicks and touch
		if (
			input.UserInputType === Enum.UserInputType.MouseButton1 ||
			input.UserInputType === Enum.UserInputType.Touch
		) {
			skipAnimation();
			return;
		}

		// Handle space key press
		if (input.KeyCode === Enum.KeyCode.Space) {
			skipAnimation();
		}
	});

	// Typewriter effect using MaxVisibleGraphemes
	useEffect(() => {
		if (!textLabelRef.current) {
			return;
		}

		// Reset state when text changes
		setMaxVisibleGraphemes(0);
		setIsComplete(false);
		cancelledRef.current = false;

		const delay = delayBetweenChars;

		// Spawn coroutine for typewriter effect
		let loopingSound: Sound | undefined;
		if (typingSound) {
			loopingSound = playSound(typingSound, { volume: typingSoundVolume });
			if (loopingSound) loopingSound.Looped = true;
		}

		const thread = task.spawn(() => {
			let index = 0;
			for (const [,] of utf8.graphemes(text)) {
				if (cancelledRef.current || !textLabelRef.current) {
					break;
				}
				index++;
				setMaxVisibleGraphemes(index);
				task.wait(delay);
			}

			if (loopingSound) loopingSound.Destroy();

			if (!cancelledRef.current) {
				setIsComplete(true);
				onComplete?.();
			}
		});

		threadRef.current = thread;

		// Cleanup on unmount or when text changes
		return () => {
			cancelledRef.current = true;
			if (loopingSound) loopingSound.Destroy();
			if (threadRef.current) {
				task.cancel(threadRef.current);
			}
		};
	}, [text, delayBetweenChars, onComplete]);

	const paddingUdim = useMemo(() => new UDim(0, rem(padding ?? 0)), [padding, rem]);

	return (
		<textlabel
			ref={textLabelRef}
			key={name || "typewriter-textlabel"}
			Font={Enum.Font.Unknown}
			FontFace={font || fonts.inter.regular}
			Text={text}
			TextColor3={textColor}
			TextSize={textSize ?? rem(1)}
			TextTransparency={textTransparency}
			TextWrapped={textWrapped}
			TextXAlignment={textXAlignment}
			TextYAlignment={textYAlignment}
			TextTruncate={textTruncate}
			TextScaled={textScaled}
			LineHeight={textHeight ?? lineHeight}
			RichText={richText}
			MaxVisibleGraphemes={maxVisibleGraphemes}
			Size={size}
			AutomaticSize={textAutoResize}
			Position={position}
			AnchorPoint={anchorPoint}
			BorderSizePixel={0}
			BackgroundColor3={backgroundColor}
			BackgroundTransparency={backgroundTransparency ?? 1}
			ClipsDescendants={clipsDescendants}
			Visible={visible}
			ZIndex={zIndex}
			LayoutOrder={layoutOrder}
			Change={change}
			Selectable={selectable}
			Event={event}
		>
			<uipadding
				PaddingLeft={paddingUdim}
				PaddingRight={paddingUdim}
				PaddingTop={paddingUdim}
				PaddingBottom={paddingUdim}
			/>
			{cornerRadius && <uicorner CornerRadius={cornerRadius} />}
			{children}
		</textlabel>
	);
}
