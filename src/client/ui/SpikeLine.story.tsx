import React, { useEffect, useRef, useState } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Frame } from "@rbxts-ui/primitives";
import { RemProvider } from "client/ui/rem/RemProvider";
import { useRem } from "client/ui/rem/useRem";
import { palette } from "shared/constants/palette";

import { SpikeLine } from "./SpikeLine";

function getEdgePoint(
	angleDeg: number,
	frameWidth: number,
	frameHeight: number,
): { edgeX: number; edgeY: number; dirX: number; dirY: number } {
	const rad = math.rad(angleDeg);
	const dirX = math.sin(rad);
	const dirY = -math.cos(rad);
	const halfW = frameWidth / 2;
	const halfH = frameHeight / 2;
	const tx = dirX !== 0 ? halfW / math.abs(dirX) : math.huge;
	const ty = dirY !== 0 ? halfH / math.abs(dirY) : math.huge;
	const edgeDist = math.min(tx, ty);

	return {
		edgeX: halfW + edgeDist * dirX,
		edgeY: halfH + edgeDist * dirY,
		dirX,
		dirY,
	};
}

function StoryComponent() {
	const rem = useRem();
	const containerRef = useRef<Frame>();
	const [frameSize, setFrameSize] = useState(new Vector2(0, 0));
	const frameWidth = frameSize.X;
	const frameHeight = frameSize.Y;

	useEffect(() => {
		const updateSize = () => {
			const size = containerRef.current?.AbsoluteSize;
			if (size) setFrameSize(new Vector2(size.X, size.Y));
		};

		updateSize();

		if (!containerRef.current) return;

		const conn = containerRef.current.GetPropertyChangedSignal("AbsoluteSize").Connect(updateSize);
		return () => conn.Disconnect();
	}, []);

	const spikeCount = 20;
	const spikeLength = rem(120, "pixel");
	const thickness = rem(16, "pixel");

	const hasSize = frameWidth > 1 && frameHeight > 1;

	const spikeElements = new Array<React.Element>();

	if (hasSize) {
		for (let index = 0; index < spikeCount; index++) {
			const angleDeg = (360 / spikeCount) * index;
			const { edgeX, edgeY, dirX, dirY } = getEdgePoint(angleDeg, frameWidth, frameHeight);
			const tipX = edgeX - dirX * spikeLength;
			const tipY = edgeY - dirY * spikeLength;

			spikeElements.push(
				<SpikeLine
					key={`spike-${index}`}
					startX={edgeX}
					startY={edgeY}
					endX={tipX}
					endY={tipY}
					thickness={thickness}
					color={palette.white}
					zIndex={2}
				/>,
			);
		}
	}

	return (
		<Frame
			ref={containerRef}
			size={new UDim2(1, 0, 1, 0)}
			backgroundColor={Color3.fromRGB(20, 20, 20)}
			backgroundTransparency={0}
		>
			{spikeElements}
		</Frame>
	);
}

export = (target: Frame) => {
	const root = ReactRoblox.createRoot(target);
	root.render(
		<RemProvider>
			<StoryComponent />
		</RemProvider>,
	);

	return () => {
		root.unmount();
	};
};
