import {
	COST_BULLDOZE,
	COST_COAL_POWER,
	COST_COMMERCIAL,
	COST_FIRE_STATION,
	COST_INDUSTRIAL,
	COST_PARK,
	COST_POLICE_STATION,
	COST_POWER_LINE,
	COST_RAIL,
	COST_RESIDENTIAL,
	COST_ROAD,
} from "shared/constants/core";

export interface ToolDefinition {
	readonly id: CityTool;
	readonly label: string;
	readonly cost: number;
	readonly color: Color3;
	readonly shortcut: Enum.KeyCode;
}

export const TOOLS: ToolDefinition[] = [
	{ id: "residential", label: "R", cost: COST_RESIDENTIAL, color: Color3.fromRGB(76, 175, 80), shortcut: Enum.KeyCode.R },
	{ id: "commercial", label: "C", cost: COST_COMMERCIAL, color: Color3.fromRGB(33, 150, 243), shortcut: Enum.KeyCode.C },
	{ id: "industrial", label: "I", cost: COST_INDUSTRIAL, color: Color3.fromRGB(255, 193, 7), shortcut: Enum.KeyCode.I },
	{ id: "road", label: "Road", cost: COST_ROAD, color: Color3.fromRGB(80, 80, 80), shortcut: Enum.KeyCode.T },
	{ id: "rail", label: "Rail", cost: COST_RAIL, color: Color3.fromRGB(100, 80, 60), shortcut: Enum.KeyCode.L },
	{ id: "powerline", label: "Wire", cost: COST_POWER_LINE, color: Color3.fromRGB(255, 255, 200), shortcut: Enum.KeyCode.P },
	{ id: "fire_station", label: "Fire", cost: COST_FIRE_STATION, color: Color3.fromRGB(244, 67, 54), shortcut: Enum.KeyCode.F },
	{ id: "police_station", label: "Police", cost: COST_POLICE_STATION, color: Color3.fromRGB(63, 81, 181), shortcut: Enum.KeyCode.O },
	{ id: "coal_power", label: "Power", cost: COST_COAL_POWER, color: Color3.fromRGB(66, 66, 66), shortcut: Enum.KeyCode.G },
	{ id: "park", label: "Park", cost: COST_PARK, color: Color3.fromRGB(34, 139, 34), shortcut: Enum.KeyCode.K },
	{ id: "bulldoze", label: "Doze", cost: COST_BULLDOZE, color: Color3.fromRGB(255, 87, 34), shortcut: Enum.KeyCode.B },
];
