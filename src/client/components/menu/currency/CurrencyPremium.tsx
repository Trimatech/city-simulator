import React from "@rbxts/react";
import { MarketplaceService, Players } from "@rbxts/services";
import { sendAlert } from "client/alerts";
import { MainButton, ShopButtonText } from "client/ui/MainButton";
import { useRem } from "client/ui/rem/useRem";
import { palette } from "shared/constants/palette";

export function CurrencyPremium() {
	const rem = useRem();
	const promptPremiumPurchase = async () => {
		if (Players.LocalPlayer?.MembershipType === Enum.MembershipType.Premium) {
			sendAlert({
				emoji: "💎",
				message:
					"You get <font color='#fff'>20% more money</font> because of <font color='#fff'>Premium benefits</font>!",
				color: palette.sapphire,
				colorSecondary: palette.blue,
			});
		} else {
			MarketplaceService.PromptPremiumPurchase(Players.LocalPlayer);
		}
	};

	return (
		<MainButton
			onClick={promptPremiumPurchase}
			anchorPoint={new Vector2(1, 1)}
			position={new UDim2(1, rem(-3), 1, rem(-3))}
			size={new UDim2(0, rem(4), 0, rem(4))}
		>
			<ShopButtonText text={`${RobloxEmoji.Premium} `} />
		</MainButton>
	);
}
