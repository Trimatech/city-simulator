import React, { useBinding } from "@rbxts/react";
import { useRem } from "client/hooks";
import { CanvasGroup } from "client/ui/canvas-group";
import { Image } from "client/ui/image";
import { Frame } from "client/ui/layout/frame";
import { VStack } from "client/ui/layout/VStack";
import { palette } from "shared/constants/palette";

interface BgWindowProps extends React.PropsWithChildren {
	readonly image: string;
	readonly accentColor?: Color3;
	readonly secondaryColor?: Color3;
	readonly position?: UDim2 | React.Binding<UDim2>;
	readonly anchorPoint?: Vector2 | React.Binding<Vector2>;
	readonly layoutOrder?: number | React.Binding<number>;
}

export function BgWindow({
	image,
	accentColor = palette.sky,
	secondaryColor = palette.blue,
	position,
	anchorPoint = new Vector2(0.5, 0.5),
	layoutOrder,
	children,
}: BgWindowProps) {
	const rem = useRem();
	const [contentSize, setContentSize] = useBinding(new Vector2(0, 0));

	return (
		<Frame
			size={contentSize.map((s) => new UDim2(0, s.X, 0, s.Y))}
			position={position}
			anchorPoint={anchorPoint}
			layoutOrder={layoutOrder}
		>
			{/* Background */}
			<CanvasGroup
				backgroundColor={palette.black}
				backgroundTransparency={0.3}
				size={new UDim2(1, 0, 1, 0)}
				cornerRadius={new UDim(0, rem(2))}
			>
				<Image
					image={image}
					scaleType="Tile"
					tileSize={new UDim2(0, rem(8), 0, rem(8))}
					imageTransparency={0.3}
					size={new UDim2(1, 0, 1, 0)}
				>
					<uigradient Color={new ColorSequence(accentColor, secondaryColor)} Rotation={90} />
				</Image>
			</CanvasGroup>

			<uistroke Color={accentColor} Transparency={0} Thickness={rem(0.5)} />
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
				{children}
			</VStack>
		</Frame>
	);
}
