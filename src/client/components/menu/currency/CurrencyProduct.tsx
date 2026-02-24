import { lerpBinding, useTimeout } from "@rbxts/pretty-react-hooks";
import React, { useMemo } from "@rbxts/react";
import { MarketplaceService, Players } from "@rbxts/services";
import { fonts } from "client/constants/fonts";
import { useMotion, useProductPrice, useRem } from "client/hooks";
import { Frame } from "client/ui/layout/frame";
import { Group } from "client/ui/layout/group";
import { PrimaryButton } from "client/ui/PrimaryButton";
import { ReactiveButton } from "client/ui/reactive-button";
import { Text } from "client/ui/text";
import { Transition } from "client/ui/transition";
import { palette } from "shared/constants/palette";
import { brighten } from "shared/utils/color-utils";

interface SupportProductProps extends React.PropsWithChildren {
	readonly index: number;
	readonly productId: number;
	readonly productTitle: string;
	readonly productSubtitle: string;
	readonly productDiscount?: string;
	readonly primaryColor: Color3;
	readonly secondaryColor: Color3;
	readonly size: UDim2;
	readonly position: UDim2;
}

export function CurrencyProduct({
	index,
	productId,
	productTitle,
	productSubtitle,
	productDiscount,
	primaryColor,
	secondaryColor,
	size,
	position,
	children,
}: SupportProductProps) {
	const rem = useRem();
	const price = useProductPrice(productId);

	const initialRotation = useMemo(() => {
		return math.random(15, 30) * (math.random() > 0.5 ? 1 : -1);
	}, []);

	const [hover, hoverMotion] = useMotion(0);
	const [transition, transitionMotion] = useMotion(0);
	const [visible, visibleMotion] = useMotion(0);

	const promptPurchase = async () => {
		MarketplaceService.PromptProductPurchase(Players.LocalPlayer, productId);
	};

	const gradient = new ColorSequence(primaryColor, secondaryColor);

	useTimeout(() => {
		transitionMotion.spring(1, {
			tension: 180,
			friction: 20,
			mass: 2 + 0.3 * index,
			restingVelocity: 0.0001,
		});

		visibleMotion.spring(1, {
			tension: 150,
			friction: 30,
		});
	}, 0.07 * index);

	return (
		<Transition
			groupTransparency={lerpBinding(visible, 1, 0)}
			rotation={lerpBinding(visible, initialRotation, 0)}
			size={size}
			position={lerpBinding(transition, position.add(new UDim2(0, 0, 0, rem(6))), position)}
		>
			<ReactiveButton
				onClick={promptPurchase}
				onHover={(hovered) => hoverMotion.spring(hovered ? 1 : 0)}
				backgroundTransparency={1}
				size={new UDim2(1, 0, 1, 0)}
			>
				<Frame
					backgroundColor={palette.white}
					cornerRadius={new UDim(0, rem(2))}
					size={new UDim2(1, 0, 1, 0)}
					backgroundTransparency={0}
				>
					<uigradient Color={gradient} Rotation={95} />

					<Frame
						backgroundColor={brighten(primaryColor, 2)}
						backgroundTransparency={lerpBinding(hover, 1, 0)}
						cornerRadius={new UDim(0, rem(2))}
						size={new UDim2(1, 0, 1, 0)}
					>
						<uigradient Transparency={new NumberSequence(0, 1)} Rotation={95} />
					</Frame>

					<Frame
						backgroundColor={brighten(secondaryColor, 2)}
						backgroundTransparency={lerpBinding(hover, 1, 0)}
						cornerRadius={new UDim(0, rem(2))}
						size={new UDim2(1, 0, 1, 0)}
					>
						<uigradient Transparency={new NumberSequence(1, 0)} Rotation={95} />
					</Frame>
				</Frame>

				<Group
					anchorPoint={new Vector2(0.5, 0)}
					size={new UDim2(0, rem(10), 0, rem(7))}
					position={new UDim2(0.5, 0, 0, rem(2))}
				>
					<Text
						font={fonts.inter.bold}
						text={productTitle}
						textSize={rem(4.5)}
						textColor={palette.base}
						size={new UDim2(1, 0, 1, 0)}
					/>

					<Text
						font={fonts.inter.bold}
						text={productSubtitle}
						textSize={rem(1.25)}
						textColor={palette.base}
						textYAlignment="Bottom"
						size={new UDim2(1, 0, 1, 0)}
					/>

					{productDiscount !== undefined && (
						<Text
							richText
							font={fonts.inter.bold}
							text={productDiscount}
							textSize={rem(1.25)}
							textColor={palette.base}
							textYAlignment="Top"
							size={new UDim2(1, 0, 1, 0)}
						/>
					)}
				</Group>

				<PrimaryButton
					onClick={promptPurchase}
					overlayGradient={gradient}
					anchorPoint={new Vector2(0.5, 1)}
					size={new UDim2(1, rem(-4), 0, rem(4.25))}
					position={new UDim2(0.5, 0, 1, rem(-2.25))}
				>
					<Text
						font={fonts.inter.medium}
						text={`${RobloxEmoji.Robux}${price}`}
						textSize={rem(1.5)}
						textColor={palette.base}
						position={new UDim2(0.5, 0, 0.5, 0)}
					/>
				</PrimaryButton>

				{children}
			</ReactiveButton>
		</Transition>
	);
}
