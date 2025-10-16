import React from "@rbxts/react";
import { omit } from "client/utils/object-utils";

import { Frame, FrameProps } from "./frame";

export interface StackProps extends FrameProps {
	spacing?: number;
	padding?: number;
	horizontalAlignment?: Enum.HorizontalAlignment;
	verticalAlignment?: Enum.VerticalAlignment;
	name?: string;
	wraps?: boolean;
}

export function HStack(props: StackProps) {
	const { children, spacing = 0, padding = 0, horizontalAlignment, verticalAlignment, name, wraps } = props;

	const rest = omit(props, [
		"children",
		"spacing",
		"padding",
		"horizontalAlignment",
		"verticalAlignment",
		"name",
		"wraps",
	]);

	return (
		<Frame key={name ?? "hstack-list"} size={new UDim2(1, 0, 1, 0)} backgroundTransparency={1} {...rest}>
			<uilistlayout
				key="hstack"
				FillDirection={Enum.FillDirection.Horizontal}
				HorizontalAlignment={horizontalAlignment ?? Enum.HorizontalAlignment.Left}
				VerticalAlignment={verticalAlignment ?? Enum.VerticalAlignment.Center}
				Padding={new UDim(0, spacing)}
				SortOrder={Enum.SortOrder.LayoutOrder}
				Wraps={wraps}
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
		</Frame>
	);
}
