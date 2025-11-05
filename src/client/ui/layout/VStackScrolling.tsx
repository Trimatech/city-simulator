import React from "@rbxts/react";

import { omit } from "../../utils/object-utils";
import { ScrollingFrame, ScrollingFrameProps } from "./ScrollingFrame";

export interface StackProps extends ScrollingFrameProps {
	spacing?: number;
	padding?: number;
	horizontalAlignment?: Enum.HorizontalAlignment;
	verticalAlignment?: Enum.VerticalAlignment;
	name?: string;
	paddingTop?: number;
	paddingBottom?: number;
	paddingLeft?: number;
	paddingRight?: number;
}

export function VStackScrolling(props: StackProps) {
	const {
		children,
		spacing = 0,
		padding = 0,
		horizontalAlignment,
		verticalAlignment,
		name,
		paddingTop,
		paddingBottom,
		paddingLeft,
		paddingRight,
	} = props;

	const rest = omit(props, [
		"children",
		"spacing",
		"padding",
		"paddingTop",
		"paddingBottom",
		"paddingLeft",
		"paddingRight",
		"horizontalAlignment",
		"verticalAlignment",
		"name",
	]);

	return (
		<ScrollingFrame
			key={name ?? "vstack-scrolling-list"}
			Size={new UDim2(1, 0, 1, 0)}
			Position={new UDim2(0, 0, 0, 0)}
			BorderSizePixel={0}
			BackgroundColor3={Color3.fromRGB(0, 0, 0)}
			CanvasSize={new UDim2(0, 0, 0, 0)}
			AutomaticCanvasSize={Enum.AutomaticSize.Y}
			ClipsDescendants={false}
			LayoutOrder={2}
			{...rest}
		>
			<uilistlayout
				key="vstack"
				FillDirection={Enum.FillDirection.Vertical}
				HorizontalAlignment={horizontalAlignment ?? Enum.HorizontalAlignment.Left}
				VerticalAlignment={verticalAlignment ?? Enum.VerticalAlignment.Top}
				Padding={new UDim(0, spacing)}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
			{padding > 0 && (
				<uipadding
					PaddingLeft={new UDim(0, paddingLeft ?? padding)}
					PaddingRight={new UDim(0, paddingRight ?? padding)}
					PaddingTop={new UDim(0, paddingTop ?? padding)}
					PaddingBottom={new UDim(0, paddingBottom ?? padding)}
				/>
			)}
			<>{children}</>
		</ScrollingFrame>
	);
}
