import React, { useState } from "@rbxts/react";
import { HStack, VStack } from "@rbxts-ui/layout";
import { Frame, Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { useRem } from "client/ui/rem/useRem";
import { remotes } from "shared/remotes";
import { palette } from "shared/constants/palette";

import { AdminCommandButton } from "./AdminCommandButton";
import { AdminNumberInput } from "./AdminNumberInput";
import { AdminSoldierPicker } from "./AdminSoldierPicker";

interface AdminPanelProps {
	readonly onClose: () => void;
}

type PanelView =
	| { kind: "main" }
	| { kind: "number"; command: string; label: string; presets: number[]; target: string; argsPrefix?: string }
	| { kind: "targetPicker"; command: string; label: string; then: TargetThen }
	| { kind: "soldier"; command: string; label: string; needsNumber?: boolean; numberLabel?: string; numberPresets?: number[] }
	| { kind: "soldierNumber"; command: string; soldierId: string; label: string; presets: number[] }
	| { kind: "powerup"; soldierId?: string };

type TargetThen =
	| { kind: "number"; label: string; presets: number[]; argsPrefix?: string }
	| { kind: "fire"; args: string };

function fire(command: string, args: string, target = "") {
	remotes.admin.executeCommand.fire(command, args, target);
}

export function AdminPanel({ onClose }: AdminPanelProps) {
	const rem = useRem();
	const [view, setView] = useState<PanelView>({ kind: "main" });

	return (
		<Frame
			size={new UDim2(0, rem(52), 0, rem(40))}
			position={new UDim2(0.5, 0, 0.5, 0)}
			anchorPoint={new Vector2(0.5, 0.5)}
			backgroundColor={Color3.fromRGB(20, 22, 35)}
			backgroundTransparency={0}
			cornerRadius={new UDim(0, rem(1.5))}
		>
			<uistroke Color={palette.blue} Thickness={rem(0.15)} />
			<uipadding
				PaddingTop={new UDim(0, rem(1.2))}
				PaddingBottom={new UDim(0, rem(1.2))}
				PaddingLeft={new UDim(0, rem(1.5))}
				PaddingRight={new UDim(0, rem(1.5))}
			/>

			<VStack size={new UDim2(1, 0, 1, 0)} spacing={rem(1)}>
				{/* Header */}
				<HStack
					size={new UDim2(1, 0, 0, rem(3.5))}
					spacing={rem(1)}
					verticalAlignment={Enum.VerticalAlignment.Center}
				>
					{view.kind !== "main" && (
						<AdminCommandButton
							text="Back"
							color={Color3.fromRGB(80, 80, 100)}
							size={new UDim2(0, rem(6), 0, rem(3))}
							onClick={() => setView({ kind: "main" })}
						/>
					)}
					<Text
						text={view.kind === "main" ? "Admin Panel" : getViewTitle(view)}
						font={fonts.fredokaOne.regular}
						textColor={palette.white}
						textSize={rem(2.5)}
						size={new UDim2(0, 0, 1, 0)}
						textAutoResize="X"
						textXAlignment="Left"
						textYAlignment="Center"
					>
						<uistroke Thickness={rem(0.1)} Color={palette.blue} />
					</Text>

					<frame Size={new UDim2(1, 0, 0, 0)} BackgroundTransparency={1}>
						<uiflexitem FlexMode={Enum.UIFlexMode.Fill} />
					</frame>

					<AdminCommandButton
						text="X"
						color={Color3.fromRGB(200, 50, 50)}
						size={new UDim2(0, rem(3.5), 0, rem(3))}
						onClick={onClose}
					/>
				</HStack>

				{/* Content */}
				<scrollingframe
					Size={new UDim2(1, 0, 1, -rem(4.5))}
					BackgroundTransparency={1}
					BorderSizePixel={0}
					ScrollBarThickness={rem(0.4)}
					ScrollBarImageColor3={palette.overlay1}
					CanvasSize={new UDim2(0, 0, 0, 0)}
					AutomaticCanvasSize={Enum.AutomaticSize.Y}
					ScrollingDirection={Enum.ScrollingDirection.Y}
				>
					<uipadding PaddingRight={new UDim(0, rem(0.8))} />
					{view.kind === "main" && <MainView setView={setView} />}
					{view.kind === "number" && (
						<AdminNumberInput
							label={view.label}
							presets={view.presets}
							onSubmit={(n) => {
								const args = view.argsPrefix ? `${view.argsPrefix} ${n}` : tostring(n);
								fire(view.command, args, view.target);
								setView({ kind: "main" });
							}}
						/>
					)}
					{view.kind === "targetPicker" && (
						<TargetPickerView view={view} setView={setView} />
					)}
					{view.kind === "soldier" && (
						<AdminSoldierPicker
							label={view.label}
							onSelect={(id) => {
								if (view.needsNumber && view.numberPresets) {
									setView({
										kind: "soldierNumber",
										command: view.command,
										soldierId: id,
										label: view.numberLabel ?? "Amount",
										presets: view.numberPresets,
									});
								} else {
									fire(view.command, id);
									setView({ kind: "main" });
								}
							}}
						/>
					)}
					{view.kind === "soldierNumber" && (
						<AdminNumberInput
							label={`${view.label} for ${view.soldierId}`}
							presets={view.presets}
							onSubmit={(n) => {
								fire(view.command, `${view.soldierId} ${n}`);
								setView({ kind: "main" });
							}}
						/>
					)}
					{view.kind === "powerup" && (
						<PowerupView soldierId={view.soldierId} setView={setView} />
					)}
				</scrollingframe>
			</VStack>
		</Frame>
	);
}

function getViewTitle(view: PanelView): string {
	switch (view.kind) {
		case "number":
			return view.label;
		case "targetPicker":
			return view.label;
		case "soldier":
			return view.label;
		case "soldierNumber":
			return view.label;
		case "powerup":
			return "Bot Powerup";
		default:
			return "Admin Panel";
	}
}

// ── Target Picker View ──────────────────────────────────────────────

interface TargetPickerViewProps {
	view: Extract<PanelView, { kind: "targetPicker" }>;
	setView: (view: PanelView) => void;
}

function TargetPickerView({ view, setView }: TargetPickerViewProps) {
	return (
		<AdminSoldierPicker
			label="Pick Target Player"
			showSelf
			onSelect={(id) => {
				const thenAction = view.then;
				if (thenAction.kind === "number") {
					setView({
						kind: "number",
						command: view.command,
						label: thenAction.label,
						presets: thenAction.presets,
						target: id,
						argsPrefix: thenAction.argsPrefix,
					});
				} else {
					fire(view.command, thenAction.args, id);
					setView({ kind: "main" });
				}
			}}
		/>
	);
}

// ── Section Header ──────────────────────────────────────────────────

function SectionHeader({ text }: { text: string }) {
	const rem = useRem();
	return (
		<Text
			text={text}
			font={fonts.fredokaOne.regular}
			textColor={palette.sky}
			textSize={rem(1.8)}
			size={new UDim2(1, 0, 0, rem(2.5))}
			textXAlignment="Left"
			textYAlignment="Center"
		>
			<uistroke Thickness={rem(0.08)} Color={palette.surface1} />
		</Text>
	);
}

// ── Helper to create a targeted number command view ─────────────────

function targetedNumberView(command: string, sectionLabel: string, numberLabel: string, presets: number[]): PanelView {
	return {
		kind: "targetPicker",
		command,
		label: sectionLabel,
		then: { kind: "number", label: numberLabel, presets },
	};
}

function targetedFireView(command: string, label: string, args: string): PanelView {
	return {
		kind: "targetPicker",
		command,
		label,
		then: { kind: "fire", args },
	};
}

// ── Main view ───────────────────────────────────────────────────────

interface MainViewProps {
	setView: (view: PanelView) => void;
}

function MainView({ setView }: MainViewProps) {
	const rem = useRem();
	const btnSize = new UDim2(0, rem(11), 0, rem(3.5));
	const smallBtn = new UDim2(0, rem(8.5), 0, rem(3.5));

	const orbColor = Color3.fromRGB(255, 180, 50);
	const moneyColor = Color3.fromRGB(80, 200, 80);
	const areaColor = Color3.fromRGB(100, 160, 255);
	const botColor = Color3.fromRGB(200, 130, 255);
	const scenarioColor = Color3.fromRGB(255, 100, 100);
	const utilColor = Color3.fromRGB(150, 150, 170);

	return (
		<VStack size={new UDim2(1, 0, 0, 0)} automaticSize={Enum.AutomaticSize.Y} spacing={rem(0.8)}>
			{/* ── Orbs ── */}
			<SectionHeader text="Orbs" />
			<frame Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					Wraps={true}
					Padding={new UDim(0, rem(0.6))}
				/>
				<AdminCommandButton
					text="Set Orbs"
					color={orbColor}
					size={btnSize}
					onClick={() => setView(targetedNumberView("orbset", "Set Orbs", "Set Orbs To", [0, 50, 100, 200, 400]))}
				/>
				<AdminCommandButton
					text="Add Orbs"
					color={orbColor}
					size={btnSize}
					onClick={() => setView(targetedNumberView("orbadd", "Add Orbs", "Add Orbs", [10, 25, 50, 100, 200]))}
				/>
				<AdminCommandButton
					text="Remove Orbs"
					color={orbColor}
					size={btnSize}
					onClick={() => setView(targetedNumberView("orbremove", "Remove Orbs", "Remove Orbs", [10, 25, 50, 100, 200]))}
				/>
			</frame>

			{/* ── Money ── */}
			<SectionHeader text="Money" />
			<frame Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					Wraps={true}
					Padding={new UDim(0, rem(0.6))}
				/>
				<AdminCommandButton
					text="Add Money"
					color={moneyColor}
					size={btnSize}
					onClick={() => setView(targetedNumberView("moneyadd", "Add Money", "Add Money", [100, 500, 1000, 5000, 10000]))}
				/>
				<AdminCommandButton
					text="Remove Money"
					color={moneyColor}
					size={btnSize}
					onClick={() => setView(targetedNumberView("moneyremove", "Remove Money", "Remove Money", [100, 500, 1000, 5000, 10000]))}
				/>
			</frame>

			{/* ── Area ── */}
			<SectionHeader text="Area" />
			<frame Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					Wraps={true}
					Padding={new UDim(0, rem(0.6))}
				/>
				<AdminCommandButton
					text="Grow Area"
					color={areaColor}
					size={btnSize}
					onClick={() => setView(targetedNumberView("areagrow", "Grow Area", "Grow Area (studs)", [50, 100, 500, 1000, 5000]))}
				/>
				<AdminCommandButton
					text="Shape: Narrow"
					color={areaColor}
					size={btnSize}
					onClick={() => setView(targetedFireView("areashape", "Shape Narrow", "narrow"))}
				/>
				<AdminCommandButton
					text="Shape: Circle"
					color={areaColor}
					size={btnSize}
					onClick={() => setView(targetedFireView("areashape", "Shape Circle", "circle"))}
				/>
			</frame>

			{/* ── Bots ── */}
			<SectionHeader text="Bots" />
			<frame Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					Wraps={true}
					Padding={new UDim(0, rem(0.6))}
				/>
				<AdminCommandButton
					text="Add Bots"
					color={botColor}
					size={btnSize}
					onClick={() => setView(targetedNumberView("botadd", "Add Bots", "Bot Count", [1, 2, 3, 5, 10]))}
				/>
				<AdminCommandButton
					text="Bot Grow"
					color={botColor}
					size={btnSize}
					onClick={() =>
						setView({
							kind: "soldier",
							command: "botgrow",
							label: "Bot Grow - Pick Bot",
							needsNumber: true,
							numberLabel: "Grow Amount",
							numberPresets: [50, 100, 500, 1000, 5000],
						})
					}
				/>
				<AdminCommandButton
					text="Bot Shape"
					color={botColor}
					size={btnSize}
					onClick={() =>
						setView({
							kind: "soldier",
							command: "botarea",
							label: "Bot Shape - Pick Bot",
						})
					}
				/>
				<AdminCommandButton
					text="Bot Stop"
					color={botColor}
					size={smallBtn}
					onClick={() =>
						setView({
							kind: "soldier",
							command: "botstop",
							label: "Bot Stop - Pick Bot",
						})
					}
				/>
				<AdminCommandButton
					text="Bot Go"
					color={botColor}
					size={smallBtn}
					onClick={() =>
						setView({
							kind: "soldier",
							command: "botgo",
							label: "Bot Go - Pick Bot",
						})
					}
				/>
				<AdminCommandButton
					text="Bot Face"
					color={botColor}
					size={smallBtn}
					onClick={() =>
						setView({
							kind: "soldier",
							command: "botface",
							label: "Bot Face - Pick Bot",
						})
					}
				/>
				<AdminCommandButton
					text="Bot Come"
					color={botColor}
					size={smallBtn}
					onClick={() =>
						setView({
							kind: "soldier",
							command: "botcome",
							label: "Bot Come - Pick Bot",
						})
					}
				/>
				<AdminCommandButton
					text="Bot Powerup"
					color={botColor}
					size={btnSize}
					onClick={() => setView({ kind: "powerup" })}
				/>
			</frame>

			{/* ── Scenarios ── */}
			<SectionHeader text="Scenarios" />
			<frame Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					Wraps={true}
					Padding={new UDim(0, rem(0.6))}
				/>
				<AdminCommandButton
					text="Tower"
					color={scenarioColor}
					size={btnSize}
					onClick={() =>
						setView({
							kind: "targetPicker",
							command: "scenario",
							label: "Tower Scenario",
							then: { kind: "number", label: "Tower Scenario (bot count)", presets: [1, 3, 5, 10], argsPrefix: "tower" },
						})
					}
				/>
				<AdminCommandButton
					text="Narrow"
					color={scenarioColor}
					size={smallBtn}
					onClick={() => setView(targetedFireView("scenario", "Narrow Scenario", "narrow"))}
				/>
				<AdminCommandButton
					text="Crowd"
					color={scenarioColor}
					size={smallBtn}
					onClick={() => setView(targetedFireView("scenario", "Crowd Scenario", "crowd"))}
				/>
			</frame>

			{/* ── Utility ── */}
			<SectionHeader text="Utility" />
			<frame Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					Wraps={true}
					Padding={new UDim(0, rem(0.6))}
				/>
				<AdminCommandButton
					text="Purge All"
					color={utilColor}
					size={smallBtn}
					onClick={() => fire("purge", "")}
				/>
				<AdminCommandButton
					text="Purge Bots"
					color={utilColor}
					size={smallBtn}
					onClick={() => fire("purge", "bot")}
				/>
				<AdminCommandButton
					text="Force Reset"
					color={Color3.fromRGB(200, 50, 50)}
					size={btnSize}
					onClick={() => setView(targetedFireView("force-reset", "Force Reset", ""))}
				/>
			</frame>
		</VStack>
	);
}

// ── Powerup View ────────────────────────────────────────────────────

interface PowerupViewProps {
	soldierId?: string;
	setView: (view: PanelView) => void;
}

const POWERUPS = ["nuclear", "laser", "shield", "tower", "turbo"] as const;
const POWERUP_COLORS: Record<string, Color3> = {
	nuclear: Color3.fromRGB(255, 80, 80),
	laser: Color3.fromRGB(255, 50, 50),
	shield: Color3.fromRGB(80, 180, 255),
	tower: Color3.fromRGB(200, 160, 80),
	turbo: Color3.fromRGB(80, 255, 120),
};

function PowerupView({ soldierId, setView }: PowerupViewProps) {
	const rem = useRem();

	if (soldierId === undefined) {
		return (
			<AdminSoldierPicker
				label="Pick Bot for Powerup"
				onSelect={(id) => setView({ kind: "powerup", soldierId: id })}
			/>
		);
	}

	const btnSize = new UDim2(0, rem(11), 0, rem(3.5));

	return (
		<VStack size={new UDim2(1, 0, 0, 0)} automaticSize={Enum.AutomaticSize.Y} spacing={rem(0.8)}>
			<Text
				text={`Target: ${soldierId}`}
				font={fonts.inter.medium}
				textColor={palette.subtext0}
				textSize={rem(1.5)}
				size={new UDim2(1, 0, 0, rem(2))}
				textXAlignment="Left"
				textYAlignment="Center"
			/>
			<frame Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					Wraps={true}
					Padding={new UDim(0, rem(0.6))}
				/>
				{POWERUPS.map((p) => (
					<AdminCommandButton
						key={p}
						text={string.upper(string.sub(p, 1, 1)) + string.sub(p, 2)}
						color={POWERUP_COLORS[p] ?? Color3.fromRGB(150, 150, 170)}
						size={btnSize}
						onClick={() => {
							fire("botpower", `${soldierId} ${p}`);
							setView({ kind: "main" });
						}}
					/>
				))}
			</frame>
		</VStack>
	);
}
