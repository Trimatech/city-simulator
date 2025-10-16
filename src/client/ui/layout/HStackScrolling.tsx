import React from "@rbxts/react";
import { omit } from "../../utils/object-utils";

import { ScrollingFrame, ScrollingFrameProps } from "./ScrollingFrame";

export interface StackProps extends ScrollingFrameProps {
	spacing?: number;
	padding?: number;
	horizontalAlignment?: Enum.HorizontalAlignment;
	verticalAlignment?: Enum.VerticalAlignment;
	name?: string;
}

export function HStackScrolling(props: StackProps) {
	const { children, spacing = 0, padding = 0, horizontalAlignment, verticalAlignment, name } = props;

	const rest = omit(props, ["children", "spacing", "padding", "horizontalAlignment", "verticalAlignment", "name"]);

	return (
		<ScrollingFrame
			key={name ?? "hstack-scrolling-list"}
			Size={new UDim2(1, 0, 1, 0)}
			Position={new UDim2(0, 0, 0, 0)}
			BorderSizePixel={0}
			BackgroundColor3={Color3.fromRGB(0, 0, 0)}
			CanvasSize={new UDim2(0, 0, 0, 0)}
			AutomaticCanvasSize={Enum.AutomaticSize.X}
			LayoutOrder={2}
			{...rest}
		>
			<uilistlayout
				key="hstack"
				FillDirection={Enum.FillDirection.Horizontal}
				HorizontalAlignment={horizontalAlignment ?? Enum.HorizontalAlignment.Left}
				VerticalAlignment={verticalAlignment ?? Enum.VerticalAlignment.Center}
				Padding={new UDim(0, spacing)}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
			{padding > 0 && (
				<uipadding
					PaddingLeft={new UDim(0, padding)}
					PaddingRight={new UDim(0, padding)}
					PaddingTop={new UDim(0, padding)}
					PaddingBottom={new UDim(0, padding)}
				/>
			)}
			<>{children}</>
		</ScrollingFrame>
	);
}
