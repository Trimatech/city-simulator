import React, { useState } from "@rbxts/react";
import { VStack } from "@rbxts-ui/layout";
import { Frame, Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { useRem } from "client/ui/rem/useRem";
import { palette } from "shared/constants/palette";

import { AdminCommandButton } from "./AdminCommandButton";

interface AdminNumberInputProps {
	readonly label: string;
	readonly presets: number[];
	readonly onSubmit: (value: number) => void;
}

export function AdminNumberInput({ label, presets, onSubmit }: AdminNumberInputProps) {
	const rem = useRem();
	const [customValue, setCustomValue] = useState("");

	return (
		<VStack size={new UDim2(1, 0, 0, 0)} automaticSize={Enum.AutomaticSize.Y} spacing={rem(1)}>
			<Text
				text={label}
				font={fonts.inter.medium}
				textColor={palette.subtext0}
				textSize={rem(1.5)}
				size={new UDim2(1, 0, 0, rem(2))}
				textXAlignment="Left"
				textYAlignment="Center"
			/>

			{/* Preset buttons */}
			<frame Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					SortOrder={Enum.SortOrder.LayoutOrder}
					Wraps={true}
					Padding={new UDim(0, rem(0.6))}
				/>
				{[...presets]
					.sort((a, b) => a < b)
					.map((n, i) => (
						<AdminCommandButton
							key={`preset-${n}`}
							text={tostring(n)}
							color={Color3.fromRGB(60, 120, 200)}
							size={new UDim2(0, rem(7), 0, rem(3.5))}
							onClick={() => onSubmit(n)}
							layoutOrder={i}
						/>
					))}
			</frame>

			{/* Custom input */}
			<frame Size={new UDim2(1, 0, 0, rem(3.5))} BackgroundTransparency={1}>
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					Padding={new UDim(0, rem(0.6))}
					VerticalAlignment={Enum.VerticalAlignment.Center}
				/>
				<Frame
					backgroundColor={Color3.fromRGB(30, 32, 48)}
					cornerRadius={new UDim(0, rem(0.6))}
					size={new UDim2(0, rem(14), 0, rem(3.2))}
					backgroundTransparency={0}
				>
					<uistroke Color={palette.surface2} Thickness={rem(0.1)} />
					<textbox
						Size={new UDim2(1, 0, 1, 0)}
						BackgroundTransparency={1}
						TextColor3={palette.white}
						PlaceholderText="Custom..."
						PlaceholderColor3={palette.overlay0}
						FontFace={fonts.inter.medium}
						TextSize={rem(1.6)}
						Text={customValue}
						Change={{ Text: (rbx) => setCustomValue(rbx.Text) }}
						ClearTextOnFocus={false}
					>
						<uipadding PaddingLeft={new UDim(0, rem(1))} PaddingRight={new UDim(0, rem(1))} />
					</textbox>
				</Frame>
				<AdminCommandButton
					text="Go"
					color={Color3.fromRGB(80, 180, 80)}
					size={new UDim2(0, rem(6), 0, rem(3.2))}
					onClick={() => {
						const n = tonumber(customValue);
						if (n !== undefined) {
							onSubmit(n);
						}
					}}
				/>
			</frame>
		</VStack>
	);
}
