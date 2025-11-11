import React from "@rbxts/react";
import { useRem } from "client/hooks";
import { Image } from "client/ui/image";
import { Frame } from "client/ui/layout/frame";
import { Outline } from "client/ui/outline";
import { ReactiveButton } from "client/ui/reactive-button/reactive-button";
import { palette } from "shared/constants/palette";

export function CloseButton({
	onClick,
	sizeRem = 4,
	imageId = "rbxassetid://131949342808598",
	position,
	anchorPoint,
	zIndex,
	layoutOrder,
}: CloseButtonProps) {
	const rem = useRem();
	const buttonSize = rem(sizeRem);
	const fullRound = new UDim(1, 0);

	return (
		<ReactiveButton
			onClick={onClick}
			backgroundTransparency={1}
			size={new UDim2(0, buttonSize, 0, buttonSize)}
			position={position}
			anchorPoint={anchorPoint}
			zIndex={zIndex}
			layoutOrder={layoutOrder}
		>
			<Frame
				backgroundTransparency={0}
				cornerRadius={fullRound}
				size={new UDim2(1, 0, 1, 0)}
				backgroundColor={palette.blue}
			>
				<Outline
					cornerRadius={fullRound}
					innerTransparency={0}
					outerTransparency={1}
					innerColor={palette.white}
				/>
				<Image
					image={imageId}
					size={new UDim2(0.6, 0, 0.6, 0)}
					position={new UDim2(0.5, 0, 0.5, 0)}
					anchorPoint={new Vector2(0.5, 0.5)}
					backgroundTransparency={1}
					zIndex={(zIndex ?? 0) + 1}
				/>
			</Frame>
		</ReactiveButton>
	);
}

interface CloseButtonProps {
	readonly onClick?: () => void;
	readonly sizeRem?: number;
	readonly imageId?: string;
	readonly position?: UDim2;
	readonly anchorPoint?: Vector2;
	readonly zIndex?: number;
	readonly layoutOrder?: number;
}
