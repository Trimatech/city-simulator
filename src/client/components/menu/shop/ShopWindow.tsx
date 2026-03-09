import React, { useState } from "@rbxts/react";
import { CurrencyProducts } from "client/components/menu/currency/CurrencyProducts";
import { Tabs } from "client/components/tabs/Tabs";
import { useRem } from "client/hooks";
import { CanvasGroup } from "client/ui/canvas-group";
import { CloseButton } from "client/ui/buttons/CloseButton";
import { Image } from "client/ui/image";
import { Frame } from "client/ui/layout/frame";
import { Outline } from "client/ui/outline";
import assets from "shared/assets";
import { palette } from "shared/constants/palette";

import { SkinsList } from "../skins/SkinsList";

enum ShopTabs {
	Skins,
	Currency,
}

const tabs = [
	{ text: "Skins", id: ShopTabs.Skins, emoji: "🎨" },
	{ text: "Currency", id: ShopTabs.Currency, emoji: "💵" },
];

interface ShopWindowProps {
	readonly onClose?: () => void;
}

export function ShopWindow({ onClose }: ShopWindowProps) {
	const rem = useRem();
	const headerHeight = rem(8);

	const [activeTabId, setActiveTabId] = useState(ShopTabs.Skins);

	const cornerRadius = new UDim(0, rem(2));

	return (
		<Frame
			size={new UDim2(0.9, 0, 0.9, 0)}
			name="ShopWindow"
			position={new UDim2(0.5, 0, 0.5, 0)}
			anchorPoint={new Vector2(0.5, 0.5)}
		>
			{/* Background */}
			<CanvasGroup
				backgroundColor={palette.black}
				backgroundTransparency={0.3}
				size={new UDim2(1, 0, 1, 0)}
				cornerRadius={new UDim(0, rem(2))}
			>
				<Image
					image={assets.ui.diagonal_stripes}
					scaleType="Tile"
					tileSize={new UDim2(0, rem(8), 0, rem(8))}
					imageTransparency={0.3}
					size={new UDim2(1, 0, 1, 0)}
				>
					<uigradient Color={new ColorSequence(palette.sky, palette.blue)} Rotation={90} />
				</Image>
			</CanvasGroup>

			<uistroke Color={palette.sky} Transparency={0} Thickness={rem(0.5)} />
			<uicorner CornerRadius={new UDim(0, rem(2))} />

			<CloseButton
				onClick={onClose}
				anchorPoint={new Vector2(1, 0)}
				position={new UDim2(1, -rem(2), 0, rem(2))}
			/>

			<Tabs tabs={tabs} activeTabId={activeTabId as number} setActiveTabId={setActiveTabId} />

			<Frame
				size={new UDim2(1, 0, 1, -headerHeight)}
				position={new UDim2(0, 0, 0, headerHeight)}
				clipsDescendants={true}
				backgroundTransparency={0}
				name="ShopContent"
				cornerRadius={cornerRadius}
				backgroundColor={palette.white}
			>
				<Outline
					cornerRadius={cornerRadius}
					innerTransparency={0}
					outerTransparency={1}
					innerColor={palette.blue}
					innerThickness={rem(0.4)}
				/>
				{activeTabId === ShopTabs.Skins && <SkinsList />}
				{activeTabId === ShopTabs.Currency && <CurrencyProducts />}
			</Frame>
		</Frame>
	);
}
