import React from "@rbxts/react";
import { useRem } from "client/hooks";

export interface ScrollingFrameProps extends Partial<React.InstanceProps<ScrollingFrame>> {
	children: React.ReactNode;
}

/**
 * Renders a scrolling frame component.
 *
 * @example
 *
 * ```tsx
 * const [canvasSizeY, setCanvasSizeY] = useState(0);
 *
 * <ScrollingFrame
 * 	CanvasSize={canvasSize}
 * 	Native={{ Size: new UDim2(1, 0, 1, 0) }}
 * >
 * 	<uigridlayout
 * 		CellPadding={new UDim2(0, 0, 0, 5)}
 * 		CellSize={new UDim2(0, 100, 0, 100)}
 * 		Change={{
 * 			AbsoluteContentSize: (rbx): void => {
 * 				setCanvasSizeY(rbx.AbsoluteContentSize);
 * 			},
 * 		}}
 * 	/>
 * </ScrollingFrame>;
 * ```
 *
 * @param props - The props for the scrolling frame.
 * @returns The rendered scrolling frame component.
 * @component
 *
 * @see https://developer.roblox.com/en-us/api-reference/class/ScrollingFrame
 */
export function ScrollingFrame(props: ScrollingFrameProps): React.Element {
	const rem = useRem();

	return (
		<scrollingframe BackgroundTransparency={1} {...props} BorderSizePixel={0} ScrollBarThickness={rem(0.5)}>
			{props.children}
		</scrollingframe>
	);
}
