import React, { useEffect, useRef } from "@rbxts/react";
import { RunService } from "@rbxts/services";
import { Frame } from "@rbxts-ui/primitives";
import { useRem } from "client/ui/rem/useRem";
import { palette } from "shared/constants/palette";

interface NotificationDotProps {
	readonly visible?: boolean;
	readonly size?: number;
	readonly position?: UDim2;
	readonly anchorPoint?: Vector2;
	readonly zIndex?: number;
}

export function NotificationDot({
	visible = true,
	size: sizeProp,
	position = new UDim2(1, 0, 0, 0),
	anchorPoint = new Vector2(0.5, 0.5),
	zIndex = 10,
}: NotificationDotProps) {
	const rem = useRem();
	const borderRef = useRef<Frame>();

	const dotSize = sizeProp ?? rem(1.4);
	const borderSize = dotSize + rem(0.6);

	useEffect(() => {
		if (!visible) return;

		const connection = RunService.Heartbeat.Connect((_dt) => {
			const border = borderRef.current;
			if (!border) return;

			const t = os.clock() % 1.2;
			const alpha = math.sin((t / 1.2) * math.pi);
			border.BackgroundTransparency = 0.3 + alpha * 0.5;
		});

		return () => connection.Disconnect();
	}, [visible]);

	if (!visible) return undefined;

	return (
		<frame
			Size={new UDim2(0, borderSize, 0, borderSize)}
			Position={position}
			AnchorPoint={anchorPoint}
			BackgroundTransparency={1}
			ZIndex={zIndex}
		>
			{/* Pulsating see-through border */}
			<Frame
				ref={borderRef}
				size={new UDim2(1, 0, 1, 0)}
				backgroundColor={palette.red2}
				backgroundTransparency={0.6}
				cornerRadius={new UDim(1, 0)}
			/>

			{/* Solid red dot */}
			<Frame
				size={new UDim2(0, dotSize, 0, dotSize)}
				position={new UDim2(0.5, 0, 0.5, 0)}
				anchorPoint={new Vector2(0.5, 0.5)}
				backgroundColor={palette.red2}
				backgroundTransparency={0}
				cornerRadius={new UDim(1, 0)}
				zIndex={2}
			/>
		</frame>
	);
}
