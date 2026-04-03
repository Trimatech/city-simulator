import React, { useEffect, useState } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { getActiveTool, onActiveToolChanged, setActiveTool } from "client/input/active-tool-state";
import { getToolsByCategory, TOOL_CATEGORIES, type ToolDefinition } from "client/input/tools";
import type { RootState } from "client/store";

// ── Colors ────────────────────────────────────────────────────────────

const PANEL_BG = Color3.fromRGB(22, 22, 28);
const PANEL_BORDER = Color3.fromRGB(50, 50, 60);
const GROUP_BG = Color3.fromRGB(32, 32, 40);
const BTN_IDLE = Color3.fromRGB(42, 42, 52);
const BTN_TEXT = Color3.fromRGB(220, 220, 225);
const BTN_COST = Color3.fromRGB(160, 160, 170);
const BTN_SHORTCUT = Color3.fromRGB(100, 100, 115);
const FUNDS_COLOR = Color3.fromRGB(76, 175, 80);
const GROUP_LABEL_COLOR = Color3.fromRGB(130, 130, 145);
const WHITE = Color3.fromRGB(255, 255, 255);

const FONT_BOLD = Font.fromEnum(Enum.Font.GothamBold);
const FONT_MEDIUM = Font.fromEnum(Enum.Font.GothamMedium);
const FONT_REGULAR = Font.fromEnum(Enum.Font.Gotham);

// ── Tool Button ───────────────────────────────────────────────────────

function ToolButton(props: { tool: ToolDefinition; isActive: boolean; onSelect: () => void }) {
	const { tool, isActive, onSelect } = props;

	return (
		<textbutton
			key={tool.id}
			Text=""
			Size={new UDim2(0, 72, 0, 56)}
			BackgroundColor3={isActive ? tool.color : BTN_IDLE}
			BackgroundTransparency={isActive ? 0 : 0.1}
			BorderSizePixel={0}
			AutoButtonColor={false}
			Event={{ Activated: onSelect }}
		>
			<uicorner CornerRadius={new UDim(0, 6)} />
			<uistroke
				Color={isActive ? WHITE : PANEL_BORDER}
				Thickness={isActive ? 2 : 1}
				Transparency={isActive ? 0 : 0.5}
			/>
			<uipadding
				PaddingTop={new UDim(0, 4)}
				PaddingBottom={new UDim(0, 4)}
				PaddingLeft={new UDim(0, 4)}
				PaddingRight={new UDim(0, 4)}
			/>

			{/* Color indicator dot */}
			{!isActive && (
				<frame
					key="dot"
					Size={new UDim2(0, 8, 0, 8)}
					Position={new UDim2(0.5, 0, 0, 2)}
					AnchorPoint={new Vector2(0.5, 0)}
					BackgroundColor3={tool.color}
					BorderSizePixel={0}
				>
					<uicorner CornerRadius={new UDim(1, 0)} />
				</frame>
			)}

			{/* Label */}
			<textlabel
				key="label"
				Text={tool.label}
				Size={new UDim2(1, 0, 0, 14)}
				Position={new UDim2(0, 0, 0, 12)}
				BackgroundTransparency={1}
				TextColor3={isActive ? WHITE : BTN_TEXT}
				TextSize={11}
				Font={Enum.Font.GothamBold}
				TextTruncate={Enum.TextTruncate.AtEnd}
			/>

			{/* Cost */}
			<textlabel
				key="cost"
				Text={`$${tool.cost}`}
				Size={new UDim2(1, 0, 0, 12)}
				Position={new UDim2(0, 0, 0, 27)}
				BackgroundTransparency={1}
				TextColor3={isActive ? Color3.fromRGB(220, 255, 220) : BTN_COST}
				TextSize={10}
				Font={Enum.Font.GothamMedium}
			/>

			{/* Shortcut key */}
			<textlabel
				key="shortcut"
				Text={`[${tool.shortcutLabel}]`}
				Size={new UDim2(1, 0, 0, 10)}
				Position={new UDim2(0, 0, 1, -10)}
				BackgroundTransparency={1}
				TextColor3={isActive ? Color3.fromRGB(200, 230, 200) : BTN_SHORTCUT}
				TextSize={8}
				Font={Enum.Font.Gotham}
			/>
		</textbutton>
	);
}

// ── Tool Group ────────────────────────────────────────────────────────

function ToolGroup(props: {
	label: string;
	tools: ToolDefinition[];
	activeTool: CityTool;
	onSelect: (id: CityTool) => void;
}) {
	if (props.tools.size() === 0) return undefined;

	return (
		<frame
			key={props.label}
			Size={new UDim2(0, props.tools.size() * 76 + 12, 1, 0)}
			BackgroundColor3={GROUP_BG}
			BackgroundTransparency={0.3}
			BorderSizePixel={0}
		>
			<uicorner CornerRadius={new UDim(0, 8)} />
			<uipadding
				PaddingLeft={new UDim(0, 6)}
				PaddingRight={new UDim(0, 6)}
				PaddingTop={new UDim(0, 16)}
				PaddingBottom={new UDim(0, 6)}
			/>

			{/* Group label */}
			<textlabel
				key="grouplabel"
				Text={props.label.upper()}
				Size={new UDim2(1, 0, 0, 10)}
				Position={new UDim2(0, 0, 0, 3)}
				BackgroundTransparency={1}
				TextColor3={GROUP_LABEL_COLOR}
				TextSize={8}
				Font={Enum.Font.GothamBold}
				TextXAlignment={Enum.TextXAlignment.Center}
			/>

			{/* Buttons */}
			<frame
				key="buttons"
				Size={new UDim2(1, 0, 1, -12)}
				Position={new UDim2(0, 0, 0, 14)}
				BackgroundTransparency={1}
			>
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					HorizontalAlignment={Enum.HorizontalAlignment.Center}
					VerticalAlignment={Enum.VerticalAlignment.Center}
					Padding={new UDim(0, 4)}
				/>
				{props.tools.map((tool) => (
					<ToolButton
						key={tool.id}
						tool={tool}
						isActive={props.activeTool === tool.id}
						onSelect={() => props.onSelect(tool.id)}
					/>
				))}
			</frame>
		</frame>
	);
}

// ── Main Toolbar ──────────────────────────────────────────────────────

export function Toolbar() {
	const [activeTool, setActiveToolLocal] = useState<CityTool>(getActiveTool());
	const funds = useSelector((state: RootState) => state.budget.funds);
	const population = useSelector((state: RootState) => state.simulation.population);
	const cityClass = useSelector((state: RootState) => state.simulation.cityClass);
	const simYear = useSelector((state: RootState) => state.simulation.simYear);

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
			key="ToolbarRoot"
			AnchorPoint={new Vector2(0.5, 1)}
			Position={new UDim2(0.5, 0, 1, -8)}
			AutomaticSize={Enum.AutomaticSize.XY}
			BackgroundTransparency={1}
			BorderSizePixel={0}
		>
			<uilistlayout
				FillDirection={Enum.FillDirection.Vertical}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				Padding={new UDim(0, 4)}
			/>

			{/* Status bar */}
			<frame
				key="StatusBar"
				AutomaticSize={Enum.AutomaticSize.X}
				Size={new UDim2(0, 0, 0, 28)}
				BackgroundColor3={PANEL_BG}
				BackgroundTransparency={0.15}
				BorderSizePixel={0}
			>
				<uicorner CornerRadius={new UDim(0, 8)} />
				<uistroke Color={PANEL_BORDER} Thickness={1} Transparency={0.5} />
				<uipadding
					PaddingLeft={new UDim(0, 14)}
					PaddingRight={new UDim(0, 14)}
					PaddingTop={new UDim(0, 4)}
					PaddingBottom={new UDim(0, 4)}
				/>
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					HorizontalAlignment={Enum.HorizontalAlignment.Center}
					VerticalAlignment={Enum.VerticalAlignment.Center}
					Padding={new UDim(0, 16)}
				/>

				{/* Funds */}
				<textlabel
					key="funds"
					Text={`$${string.format("%d", funds)}`}
					AutomaticSize={Enum.AutomaticSize.X}
					Size={new UDim2(0, 0, 1, 0)}
					BackgroundTransparency={1}
					TextColor3={FUNDS_COLOR}
					TextSize={14}
					Font={Enum.Font.GothamBold}
				/>

				{/* Divider */}
				<frame key="div1" Size={new UDim2(0, 1, 0.6, 0)} BackgroundColor3={PANEL_BORDER} BorderSizePixel={0} />

				{/* Population */}
				<textlabel
					key="pop"
					Text={`Pop: ${string.format("%d", population)}`}
					AutomaticSize={Enum.AutomaticSize.X}
					Size={new UDim2(0, 0, 1, 0)}
					BackgroundTransparency={1}
					TextColor3={BTN_TEXT}
					TextSize={12}
					Font={Enum.Font.GothamMedium}
				/>

				{/* Divider */}
				<frame key="div2" Size={new UDim2(0, 1, 0.6, 0)} BackgroundColor3={PANEL_BORDER} BorderSizePixel={0} />

				{/* City class & year */}
				<textlabel
					key="city"
					Text={`${cityClass} - ${simYear}`}
					AutomaticSize={Enum.AutomaticSize.X}
					Size={new UDim2(0, 0, 1, 0)}
					BackgroundTransparency={1}
					TextColor3={BTN_COST}
					TextSize={12}
					Font={Enum.Font.Gotham}
				/>
			</frame>

			{/* Tool groups */}
			<frame
				key="ToolGroups"
				AutomaticSize={Enum.AutomaticSize.XY}
				BackgroundColor3={PANEL_BG}
				BackgroundTransparency={0.1}
				BorderSizePixel={0}
			>
				<uicorner CornerRadius={new UDim(0, 10)} />
				<uistroke Color={PANEL_BORDER} Thickness={1} Transparency={0.4} />
				<uipadding
					PaddingLeft={new UDim(0, 6)}
					PaddingRight={new UDim(0, 6)}
					PaddingTop={new UDim(0, 6)}
					PaddingBottom={new UDim(0, 6)}
				/>
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					HorizontalAlignment={Enum.HorizontalAlignment.Center}
					VerticalAlignment={Enum.VerticalAlignment.Center}
					Padding={new UDim(0, 6)}
				/>

				{TOOL_CATEGORIES.map((cat) => {
					const tools = getToolsByCategory(cat.id);
					if (tools.size() === 0) return undefined;
					return (
						<ToolGroup
							key={cat.id}
							label={cat.label}
							tools={tools}
							activeTool={activeTool}
							onSelect={handleSelect}
						/>
					);
				})}
			</frame>
		</frame>
	);
}
