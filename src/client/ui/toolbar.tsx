import React, { useState, useEffect } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { getActiveTool, onActiveToolChanged, setActiveTool } from "client/input/active-tool-state";
import { TOOLS, ToolDefinition } from "client/input/tools";
import type { RootState } from "client/store";

function ToolButton(props: { tool: ToolDefinition; isActive: boolean; onSelect: () => void }) {
	const { tool, isActive, onSelect } = props;

	return (
		<textbutton
			key={tool.id}
			Text={`${tool.label}\n$${tool.cost}`}
			Size={new UDim2(0, 60, 0, 60)}
			BackgroundColor3={isActive ? tool.color : Color3.fromRGB(50, 50, 50)}
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextSize={11}
			Font={Enum.Font.GothamBold}
			BorderSizePixel={isActive ? 3 : 1}
			BorderColor3={isActive ? Color3.fromRGB(255, 255, 255) : Color3.fromRGB(80, 80, 80)}
			Event={{
				Activated: onSelect,
			}}
		>
			<uicorner CornerRadius={new UDim(0, 6)} />
		</textbutton>
	);
}

export function Toolbar() {
	const [activeTool, setActiveToolLocal] = useState<CityTool>(getActiveTool());
	const funds = useSelector((state: RootState) => state.budget.funds);

	useEffect(() => {
		const disconnect = onActiveToolChanged((tool) => {
			setActiveToolLocal(tool);
		});
		return disconnect;
	}, []);

	function handleSelect(toolId: CityTool) {
		setActiveTool(toolId);
		setActiveToolLocal(toolId);
	}

	return (
		<frame
			key="Toolbar"
			AnchorPoint={new Vector2(0.5, 1)}
			Position={new UDim2(0.5, 0, 1, -10)}
			Size={new UDim2(0, TOOLS.size() * 66 + 10, 0, 100)}
			BackgroundColor3={Color3.fromRGB(30, 30, 30)}
			BackgroundTransparency={0.2}
			BorderSizePixel={0}
		>
			<uicorner CornerRadius={new UDim(0, 10)} />
			<uipadding
				PaddingLeft={new UDim(0, 8)}
				PaddingRight={new UDim(0, 8)}
				PaddingTop={new UDim(0, 5)}
				PaddingBottom={new UDim(0, 5)}
			/>

			{/* Funds display */}
			<textlabel
				key="Funds"
				Text={`$${funds}`}
				Size={new UDim2(1, 0, 0, 20)}
				BackgroundTransparency={1}
				TextColor3={Color3.fromRGB(76, 175, 80)}
				TextSize={16}
				Font={Enum.Font.GothamBold}
				TextXAlignment={Enum.TextXAlignment.Center}
			/>

			{/* Tool buttons row */}
			<frame
				key="ToolRow"
				Position={new UDim2(0, 0, 0, 22)}
				Size={new UDim2(1, 0, 1, -22)}
				BackgroundTransparency={1}
			>
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					HorizontalAlignment={Enum.HorizontalAlignment.Center}
					Padding={new UDim(0, 4)}
				/>
				{TOOLS.map((tool) => (
					<ToolButton
						key={tool.id}
						tool={tool}
						isActive={activeTool === tool.id}
						onSelect={() => handleSelect(tool.id)}
					/>
				))}
			</frame>
		</frame>
	);
}
