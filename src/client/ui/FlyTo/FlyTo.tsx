import React, { MutableRefObject, useBinding, useEffect, useState } from "@rbxts/react";
import { RunService, Workspace } from "@rbxts/services";
import { setTimeout } from "@rbxts/set-timeout";
import { Image } from "@rbxts-ui/primitives";
import { useRem } from "client/ui/rem/useRem";
import { playSound } from "shared/assetsFolder";

interface FlyToProps {
	delay: number;
	image: string;
	from: UDim2;
	flyToRef: MutableRefObject<Frame | undefined>;
	toRef: MutableRefObject<Frame | undefined>;
	duration: number;
	curveHeight: number;
	sound?: string;
}

const getCenterPosition = (imageLabel: Frame) => {
	const absPos = imageLabel.AbsolutePosition;
	const absSize = imageLabel.AbsoluteSize;
	const centerX = absPos.X + absSize.X / 2;
	const centerY = absPos.Y + absSize.Y / 2;
	return new Vector2(centerX, centerY);
};

export function FlyTo({ delay, image, from, flyToRef, toRef, duration, curveHeight, sound }: FlyToProps) {
	const rem = useRem();
	const [position, setPosition] = useBinding(from);
	const width = rem(15);
	const [size, setSize] = useBinding(new UDim2(0, width, 0, width));
	const startSize = new Vector2(width, width);
	const [isFinished, setIsFinished] = useState(false);
	const [shouldRender, setShouldRender] = useState(false);

	useEffect(() => {
		const clearTimeout = setTimeout(() => {
			setShouldRender(true);

			if (sound) {
				playSound(sound, { volume: 0.1 });
			}
		}, delay);

		return () => clearTimeout();
	}, []);

	useEffect(() => {
		if (!shouldRender) return;

		const startTime = tick();
		const connection = RunService.RenderStepped.Connect(() => {
			const elapsed = tick() - startTime;
			const alpha = math.min(elapsed / duration, 1);

			const flyToFramePosition = flyToRef.current?.AbsolutePosition ?? new Vector2();

			const centerTo = toRef.current
				? getCenterPosition(toRef.current)
				: (() => {
						const vp = Workspace.CurrentCamera?.ViewportSize ?? new Vector2(800, 600);
						return new Vector2(vp.X / 2, vp.Y / 2);
					})();

			const asbPosTo = new UDim2(0, centerTo.X - flyToFramePosition.X, 0, centerTo.Y - flyToFramePosition.Y);

			// Calculate the curved position
			const lerpPosition = from.Lerp(asbPosTo, alpha);
			const curveOffset = new UDim2(0, 0, 0, curveHeight * math.sin(math.pi * alpha));
			const newPosition = lerpPosition.add(curveOffset);

			setPosition(newPosition);

			// Take the absolute size of the toRef image
			const targetSize = toRef.current?.AbsoluteSize ?? new Vector2(width, width);

			const lerpedSize = startSize.Lerp(targetSize, alpha);

			const newSize = new UDim2(0, lerpedSize.X, 0, lerpedSize.Y);
			setSize(newSize);

			if (alpha === 1) {
				connection.Disconnect();
				setIsFinished(true);
			}
		});

		return () => connection.Disconnect();
	}, [from, toRef, duration, curveHeight, shouldRender]);

	if (!shouldRender || isFinished) {
		return undefined;
	}

	return (
		<Image
			image={image}
			position={position}
			size={size}
			backgroundTransparency={1}
			anchorPoint={new Vector2(0.5, 0.5)}
		/>
	);
}
