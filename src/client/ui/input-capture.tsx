import { useEventListener } from "@rbxts/pretty-react-hooks";
import React, { useEffect, useRef, useState } from "@rbxts/react";
import { UserInputService } from "@rbxts/services";

import { Frame } from "./layout/frame";

// Shared lock state per ScrollingFrame to avoid conflicting restores
const scrollLocks = new Map<ScrollingFrame, { count: number; prev: boolean }>();

interface InputCaptureProps {
	readonly onInputBegan?: (rbx: Frame, input: InputObject) => void;
	readonly onInputChanged?: (rbx: Frame, input: InputObject) => void;
	readonly onInputEnded?: (rbx: Frame, input: InputObject) => void;
	readonly size?: UDim2;
	readonly position?: UDim2;
	readonly anchorPoint?: Vector2;
	// Only forward input when mouse is hovering the capture frame
	readonly hoverOnly?: boolean;
	// Make the overlay frame Active to capture inputs from parents
	readonly active?: boolean;
}

export function InputCapture({
	onInputBegan,
	onInputChanged,
	onInputEnded,
	size,
	position,
	anchorPoint,
	hoverOnly = false,
	active = true,
}: InputCaptureProps) {
	const [frame, setFrame] = useState<Frame>();
	const hoveredRef = useRef(false);
	const scrollFrameRef = useRef<ScrollingFrame>();
	const prevScrollingEnabledRef = useRef<boolean>();

	const restoreScroll = () => {
		const sf = scrollFrameRef.current;
		if (sf !== undefined) {
			const entry = scrollLocks.get(sf);
			if (entry) {
				if (entry.count > 1) {
					entry.count -= 1;
				} else {
					sf.ScrollingEnabled = entry.prev;
					scrollLocks.delete(sf);
				}
			}
		}
		scrollFrameRef.current = undefined as unknown as ScrollingFrame;
		prevScrollingEnabledRef.current = undefined as unknown as boolean;
	};

	const setHovered = (hovered: boolean) => {
		// Avoid redundant work
		if (hoveredRef.current === hovered) return;
		hoveredRef.current = hovered;
		// Toggle nearest parent ScrollingFrame scrolling when hovering
		const currentFrame = frame;
		if (!currentFrame) return;
		if (hovered) {
			let ancestor: Instance | undefined = currentFrame.Parent;
			let nearestScroll: ScrollingFrame | undefined;
			while (ancestor) {
				if (ancestor.IsA("ScrollingFrame")) {
					nearestScroll = ancestor as ScrollingFrame;
					break;
				}
				ancestor = ancestor.Parent;
			}
			if (nearestScroll) {
				scrollFrameRef.current = nearestScroll;
				const entry = scrollLocks.get(nearestScroll);
				if (entry) {
					entry.count += 1;
				} else {
					scrollLocks.set(nearestScroll, { count: 1, prev: nearestScroll.ScrollingEnabled });
				}
				nearestScroll.ScrollingEnabled = false;
			}
		} else {
			restoreScroll();
		}
	};

	// Fallback: track hover using global mouse movement to ensure leave is detected
	useEventListener(UserInputService.InputChanged, (input) => {
		const currentFrame = frame;
		if (!currentFrame) return;
		if (input.UserInputType === Enum.UserInputType.MouseMovement) {
			const mouse = UserInputService.GetMouseLocation();
			const pos = currentFrame.AbsolutePosition;
			const size2 = currentFrame.AbsoluteSize;
			const inside =
				mouse.X >= pos.X && mouse.Y >= pos.Y && mouse.X <= pos.X + size2.X && mouse.Y <= pos.Y + size2.Y;
			setHovered(inside);
		}
	});

	// Safety: when window focus is lost, restore scrolling state
	useEventListener(UserInputService.WindowFocusReleased, () => {
		setHovered(false);
	});

	// Ensure scrolling is restored if the capture unmounts while hovered
	useEffect(() => {
		return () => {
			restoreScroll();
		};
	}, []);

	useEventListener(UserInputService.InputBegan, (input, gameProcessed) => {
		if (frame && !gameProcessed) {
			if (!hoverOnly || hoveredRef.current) {
				onInputBegan?.(frame, input);
			}
		}
		// Safety: if we are no longer hovered but scroll is locked, restore it
		if (!hoveredRef.current && scrollFrameRef.current !== undefined) {
			restoreScroll();
		}
	});

	useEventListener(UserInputService.InputEnded, (input) => {
		if (frame) {
			if (!hoverOnly || hoveredRef.current) {
				onInputEnded?.(frame, input);
			}
		}
		// Safety: ensure scroll unlock after interactions end outside
		if (!hoveredRef.current && scrollFrameRef.current !== undefined) {
			restoreScroll();
		}
	});

	useEventListener(UserInputService.InputChanged, (input) => {
		if (frame) {
			if (!hoverOnly || hoveredRef.current) {
				onInputChanged?.(frame, input);
			}
		}
		// Safety: unlock if moved outside and still locked
		if (!hoveredRef.current && scrollFrameRef.current !== undefined) {
			restoreScroll();
		}
	});

	// Guarantee mouse wheel events reach consumers even when in Studio Edit
	useEventListener(UserInputService.InputChanged, (input) => {
		if (frame && input.UserInputType === Enum.UserInputType.MouseWheel) {
			if (!hoverOnly || hoveredRef.current) {
				onInputChanged?.(frame, input);
			}
		}
	});

	const handleInputBeganEvent = (rbx: Frame, input: InputObject) => {
		if (!hoverOnly || hoveredRef.current) onInputBegan?.(rbx, input);
	};
	const handleInputChangedEvent = (rbx: Frame, input: InputObject) => {
		if (!hoverOnly || hoveredRef.current) onInputChanged?.(rbx, input);
	};
	const handleInputEndedEvent = (rbx: Frame, input: InputObject) => {
		if (!hoverOnly || hoveredRef.current) onInputEnded?.(rbx, input);
	};

	return (
		<Frame
			ref={setFrame}
			size={size}
			position={position}
			anchorPoint={anchorPoint}
			active={active}
			event={{
				MouseEnter: () => setHovered(true),
				MouseLeave: () => setHovered(false),
				InputBegan: handleInputBeganEvent,
				InputChanged: handleInputChangedEvent,
				InputEnded: handleInputEndedEvent,
			}}
		/>
	);
}
