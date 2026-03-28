import React from "@rbxts/react";
import { HStack } from "@rbxts-ui/layout";
import { ROBLOX_TOOLBAR_HEIGHT, ROBLOX_TOOLBAR_WIDTH } from "client/constants/roblox.constants";

const BUTTON_SIZE = 32;
const BUTTON_PADDING = 6;
const BUTTON_COLOR = Color3.fromRGB(255, 255, 255);

function FakeRobloxButtons() {
	return (
		<frame key="roblox-buttons" Size={new UDim2(0, ROBLOX_TOOLBAR_WIDTH, 1, 0)} BackgroundTransparency={1}>
			<uilistlayout
				FillDirection="Horizontal"
				VerticalAlignment="Center"
				HorizontalAlignment="Left"
				Padding={new UDim(0, BUTTON_PADDING)}
				SortOrder="LayoutOrder"
			/>
			<uipadding PaddingLeft={new UDim(0, BUTTON_PADDING)} />

			<imagelabel
				key="menu"
				LayoutOrder={0}
				Size={new UDim2(0, BUTTON_SIZE, 0, BUTTON_SIZE)}
				BackgroundColor3={BUTTON_COLOR}
				BackgroundTransparency={0.7}
				ImageTransparency={1}
			>
				<uicorner CornerRadius={new UDim(0, 8)} />
				<textlabel
					Size={new UDim2(1, 0, 1, 0)}
					BackgroundTransparency={1}
					Text="☰"
					TextColor3={BUTTON_COLOR}
					TextSize={18}
					Font={Enum.Font.GothamBold}
				/>
			</imagelabel>

			<imagelabel
				key="chat"
				LayoutOrder={1}
				Size={new UDim2(0, BUTTON_SIZE, 0, BUTTON_SIZE)}
				BackgroundColor3={BUTTON_COLOR}
				BackgroundTransparency={0.7}
				ImageTransparency={1}
			>
				<uicorner CornerRadius={new UDim(0, 8)} />
				<textlabel
					Size={new UDim2(1, 0, 1, 0)}
					BackgroundTransparency={1}
					Text="💬"
					TextColor3={BUTTON_COLOR}
					TextSize={16}
					Font={Enum.Font.GothamBold}
				/>
			</imagelabel>

			<imagelabel
				key="leaderboard"
				LayoutOrder={2}
				Size={new UDim2(0, BUTTON_SIZE, 0, BUTTON_SIZE)}
				BackgroundColor3={BUTTON_COLOR}
				BackgroundTransparency={0.7}
				ImageTransparency={1}
			>
				<uicorner CornerRadius={new UDim(0, 8)} />
				<textlabel
					Size={new UDim2(1, 0, 1, 0)}
					BackgroundTransparency={1}
					Text="👥"
					TextColor3={BUTTON_COLOR}
					TextSize={16}
					Font={Enum.Font.GothamBold}
				/>
			</imagelabel>
		</frame>
	);
}

interface FakeTopbarProps extends React.PropsWithChildren {
	header?: React.Element;
	toolbarColor?: Color3;
}

export function FakeTopbar({ header, toolbarColor, children }: FakeTopbarProps) {
	return (
		<frame Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1}>
			<uilistlayout FillDirection="Vertical" SortOrder="LayoutOrder" />

			<HStack
				size={new UDim2(1, 0, 0, ROBLOX_TOOLBAR_HEIGHT)}
				backgroundColor={toolbarColor ?? Color3.fromRGB(0, 0, 0)}
				backgroundTransparency={toolbarColor ? 0 : 0.5}
			>
				<FakeRobloxButtons />
				{header}
			</HStack>

			<frame
				key="content"
				LayoutOrder={1}
				Size={new UDim2(1, 0, 1, -ROBLOX_TOOLBAR_HEIGHT)}
				BackgroundTransparency={1}
			>
				{children}
			</frame>
		</frame>
	);
}
