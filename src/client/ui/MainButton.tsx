import React, { useRef, useState } from "@rbxts/react";
import { Outline, ReactiveButton } from "@rbxts-ui/components";
import { Frame } from "@rbxts-ui/primitives";
import { mapMouseToUiGradient } from "client/utils/ui-gradient.utils";
import { playButtonDown, playButtonUp } from "shared/assetsFolder/sounds/play-button-sound";
import { palette } from "shared/constants/palette";
import { brighten } from "shared/utils/color-utils";

import { useMotion, useRem } from "../hooks";

interface PrimaryButtonProps extends React.PropsWithChildren {
	readonly onClick?: () => void;
	readonly onHover?: (hovered: boolean) => void;
	readonly enabled?: boolean;
	readonly primaryColor?: Color3;
	readonly size?: UDim2 | React.Binding<UDim2>;
	readonly position?: UDim2 | React.Binding<UDim2>;
	readonly anchorPoint?: Vector2 | React.Binding<Vector2>;
	readonly overlayGradient?: ColorSequence | React.Binding<ColorSequence>;
	readonly overlayTransparency?: number | React.Binding<number>;
	readonly overlayRotation?: number | React.Binding<number>;
	readonly layoutOrder?: number | React.Binding<number>;
	readonly cornerRadius?: UDim | React.Binding<UDim>;
}

export function MainButton({
	cornerRadius: cornerRadiusProp,
	onClick,
	onHover,
	enabled = true,
	size,
	position,
	anchorPoint,
	primaryColor: primaryColorProp,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	overlayGradient: _overlayGradient,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	overlayRotation: _overlayRotation,
	layoutOrder,
	children,
}: PrimaryButtonProps) {
	const rem = useRem();
	const [_hover, hoverMotion] = useMotion(0);

	const [hovered, setHovered] = useState(false);
	const uiRef = useRef<Frame>();
	const defaultOffset = new Vector2(0, 0);
	const defaultRotation = 0;
	const [hasMouseSample, setHasMouseSample] = useState(false);
	const [offset, setOffset] = useState(defaultOffset);

	const cornerRadius = cornerRadiusProp ?? new UDim(0, rem(1));

	const primaryColor = primaryColorProp ?? palette.sky;
	const brighterBlue = brighten(primaryColor, 0.5);

	const gradientColor = new ColorSequence([
		new ColorSequenceKeypoint(0, primaryColor),
		new ColorSequenceKeypoint(0.5, brighterBlue),
		new ColorSequenceKeypoint(1, primaryColor),
	]);

	const color = hovered && hasMouseSample ? gradientColor : new ColorSequence(primaryColor);

	return (
		<ReactiveButton
			onClick={onClick}
			onHover={(hovered) => {
				setHovered(hovered);
				hoverMotion.spring(hovered ? 1 : 0);
				onHover?.(hovered);
			}}
			onMouseLeave={() => {
				setOffset(defaultOffset);
				setHasMouseSample(false);
			}}
			onMouseDown={() => {
				playButtonDown("default");
			}}
			onMouseUp={() => {
				playButtonUp("default");
			}}
			event={undefined}
			backgroundTransparency={1}
			enabled={enabled}
			anchorPoint={anchorPoint}
			size={size}
			position={position}
			layoutOrder={layoutOrder}
		>
			<Frame
				backgroundColor={palette.white}
				cornerRadius={cornerRadius}
				size={new UDim2(1, 0, 1, 0)}
				backgroundTransparency={0}
				ref={uiRef}
				event={{
					MouseMoved: (rbx, x: number, y: number) => {
						const frame = uiRef.current;
						if (frame === undefined) return;

						const result = mapMouseToUiGradient({ frame, mouseX: x, mouseY: y });
						setOffset(result.offset);
						setHasMouseSample(true);
					},
				}}
			>
				<uigradient Color={color} Offset={offset} Rotation={defaultRotation} />
			</Frame>

			<Outline cornerRadius={cornerRadius} innerTransparency={0} outerTransparency={1} />

			{children}
		</ReactiveButton>
	);
}
