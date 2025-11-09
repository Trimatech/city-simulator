import React, { useEffect } from "@rbxts/react";
import { useMotion, useRem } from "client/hooks";
import { CanvasGroup } from "client/ui/canvas-group";
import { WallSkin } from "shared/constants/skins";

interface SkinThumbnailProps {
	readonly skin: WallSkin;
	readonly active: boolean;
	readonly transparency: React.Binding<number>;
}

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
		</CanvasGroup>
	);
}
