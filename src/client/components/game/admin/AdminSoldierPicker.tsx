import React from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import Object from "@rbxts/object-utils";
import { VStack } from "@rbxts-ui/layout";
import { Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { useRem } from "client/ui/rem/useRem";
import { USER_NAME } from "shared/constants/core";
import { palette } from "shared/constants/palette";
import { selectSoldiersById } from "shared/store/soldiers";

import { AdminCommandButton } from "./AdminCommandButton";

interface AdminSoldierPickerProps {
	readonly label: string;
	readonly onSelect: (id: string) => void;
	readonly showSelf?: boolean;
}

export function AdminSoldierPicker({ label, onSelect, showSelf }: AdminSoldierPickerProps) {
	const rem = useRem();
	const soldiersById = useSelector(selectSoldiersById);

	const soldiers = Object.entries(soldiersById)
		.filter(([, s]) => s !== undefined && !s.dead)
		.map(([id, s]) => ({
			id: tostring(id),
			name: s!.name,
			isBot: string.sub(tostring(id), 1, 4) === "BOT_",
			area: math.floor(s!.polygonAreaSize),
		}))
		.sort((a, b) => {
			if (a.isBot !== b.isBot) return a.isBot ? false : true;
			return a.id < b.id;
		});

	const players = soldiers.filter((s) => !s.isBot);
	const bots = soldiers.filter((s) => s.isBot);

	return (
		<VStack size={new UDim2(1, 0, 0, 0)} automaticSize={Enum.AutomaticSize.Y} spacing={rem(0.8)}>
			<Text
				text={label}
				font={fonts.inter.medium}
				textColor={palette.subtext0}
				textSize={rem(1.5)}
				size={new UDim2(1, 0, 0, rem(2))}
				textXAlignment="Left"
				textYAlignment="Center"
			/>

			{/* Self shortcut */}
			{showSelf && (
				<AdminCommandButton
					text={`Myself (${USER_NAME})`}
					color={Color3.fromRGB(80, 180, 80)}
					size={new UDim2(0, rem(14), 0, rem(3.5))}
					onClick={() => onSelect(USER_NAME)}
				/>
			)}

			{/* Nearest bot shortcut */}
			{!showSelf && (
				<AdminCommandButton
					text="Nearest Bot"
					color={Color3.fromRGB(200, 130, 255)}
					size={new UDim2(0, rem(12), 0, rem(3.5))}
					onClick={() => onSelect("")}
				/>
			)}

			{/* Players */}
			{players.size() > 0 && (
				<Text
					text="Players"
					font={fonts.fredokaOne.regular}
					textColor={palette.sky}
					textSize={rem(1.5)}
					size={new UDim2(1, 0, 0, rem(2))}
					textXAlignment="Left"
					textYAlignment="Center"
				/>
			)}
			<frame Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					Wraps={true}
					Padding={new UDim(0, rem(0.6))}
				/>
				{players.map((s) => (
					<AdminCommandButton
						key={s.id}
						text={`${s.name} (${s.area})`}
						color={s.id === USER_NAME ? Color3.fromRGB(80, 180, 80) : Color3.fromRGB(60, 150, 200)}
						size={new UDim2(0, rem(14), 0, rem(3.5))}
						onClick={() => onSelect(s.id)}
					/>
				))}
			</frame>

			{/* Bots */}
			{bots.size() > 0 && (
				<Text
					text="Bots"
					font={fonts.fredokaOne.regular}
					textColor={palette.sky}
					textSize={rem(1.5)}
					size={new UDim2(1, 0, 0, rem(2))}
					textXAlignment="Left"
					textYAlignment="Center"
				/>
			)}
			<frame Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					Wraps={true}
					Padding={new UDim(0, rem(0.6))}
				/>
				{bots.map((s) => (
					<AdminCommandButton
						key={s.id}
						text={`${s.id} (${s.area})`}
						color={Color3.fromRGB(140, 90, 200)}
						size={new UDim2(0, rem(14), 0, rem(3.5))}
						onClick={() => onSelect(s.id)}
					/>
				))}
			</frame>
		</VStack>
	);
}
