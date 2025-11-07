import React, { useEffect } from "@rbxts/react";
import { useMotion, useRem } from "client/hooks";
import { CanvasGroup } from "client/ui/canvas-group";
import { Image } from "client/ui/image";
import { SoldierSkin } from "shared/constants/skins";
import { fillArray } from "shared/utils/object-utils";
import { images } from "shared/assets";

import { SOLDIER_ANGLE_OFFSET } from "../../world/soldiers/constants";

interface SkinThumbnailProps {
	readonly skin: SoldierSkin;
	readonly active: boolean;
	readonly transparency: React.Binding<number>;
}

const TRACER_SIZE = 7;
const TRACER_POINTS = 5;
const TRACER_SQUISH = 0.4;

const TRACERS = fillArray(TRACER_POINTS, (index) => {
	const from = new Vector2(
		0.5 - (index + 1) / (TRACER_POINTS / TRACER_SQUISH),
		0.5 + (index + 1) / (TRACER_POINTS / TRACER_SQUISH),
	);

	const to = new Vector2(
		0.5 - index / (TRACER_POINTS / TRACER_SQUISH),
		0.5 + index / (TRACER_POINTS / TRACER_SQUISH),
	);

	const size = new Vector2(0, from.sub(to).Magnitude);
	const position = from.add(to).div(2);
	const rotation = math.deg(math.atan2(to.Y - from.Y, to.X - from.X) + SOLDIER_ANGLE_OFFSET);

	return { size, position, rotation };
});

export function SkinThumbnail({ skin, active, transparency }: SkinThumbnailProps) {
	const rem = useRem();
	const [offset, offsetMotion] = useMotion(new UDim());

	useEffect(() => {
		offsetMotion.spring(active ? new UDim(0, rem(-0.5)) : new UDim(0, rem(2)));
	}, [active, rem]);

	return (
		<CanvasGroup
			backgroundTransparency={1}
			cornerRadius={new UDim(0, rem(2.5))}
			groupTransparency={transparency}
			size={new UDim2(1, 0, 1, 0)}
		>
			<uipadding PaddingTop={offset} PaddingRight={offset} />

			<Image
				image={images.ui.circle}
				imageColor={skin.tint}
				anchorPoint={new Vector2(0.5, 0.5)}
				size={new UDim2(0, rem(TRACER_SIZE), 0, rem(TRACER_SIZE))}
				position={new UDim2(0.5, 0, 0.5, 0)}
				rotation={45}
			/>

			{TRACERS.map(({ size, position, rotation }, index) => (
				<Image
					key={`tracer-${index}`}
					image={images.ui.circle}
					imageColor={skin.tint}
					anchorPoint={new Vector2(0.5, 0.5)}
					size={new UDim2(size.X, rem(TRACER_SIZE), size.Y, rem(TRACER_SIZE))}
					position={new UDim2(position.X, 0, position.Y, 0)}
					rotation={rotation}
					zIndex={-index - 1}
				/>
			))}
		</CanvasGroup>
	);
}
