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

export type ToolCategory = "zones" | "transport" | "utilities" | "services" | "other";

export interface ToolDefinition {
	readonly id: CityTool;
	readonly label: string;
	readonly cost: number;
	readonly color: Color3;
	readonly shortcut: Enum.KeyCode;
	readonly category: ToolCategory;
	readonly shortcutLabel: string;
}

export const TOOL_CATEGORIES: readonly { id: ToolCategory; label: string }[] = [
	{ id: "zones", label: "Zones" },
	{ id: "transport", label: "Transport" },
	{ id: "utilities", label: "Utilities" },
	{ id: "services", label: "Services" },
	{ id: "other", label: "Other" },
];

export const TOOLS: ToolDefinition[] = [
	// Zones
	{
		id: "residential",
		label: "Residential",
		cost: COST_RESIDENTIAL,
		color: Color3.fromRGB(76, 175, 80),
		shortcut: Enum.KeyCode.R,
		category: "zones",
		shortcutLabel: "R",
	},
	{
		id: "commercial",
		label: "Commercial",
		cost: COST_COMMERCIAL,
		color: Color3.fromRGB(33, 150, 243),
		shortcut: Enum.KeyCode.C,
		category: "zones",
		shortcutLabel: "C",
	},
	{
		id: "industrial",
		label: "Industrial",
		cost: COST_INDUSTRIAL,
		color: Color3.fromRGB(255, 193, 7),
		shortcut: Enum.KeyCode.I,
		category: "zones",
		shortcutLabel: "I",
	},
	// Transport
	{
		id: "road",
		label: "Road",
		cost: COST_ROAD,
		color: Color3.fromRGB(97, 97, 97),
		shortcut: Enum.KeyCode.T,
		category: "transport",
		shortcutLabel: "T",
	},
	{
		id: "rail",
		label: "Railroad",
		cost: COST_RAIL,
		color: Color3.fromRGB(121, 85, 72),
		shortcut: Enum.KeyCode.L,
		category: "transport",
		shortcutLabel: "L",
	},
	// Utilities
	{
		id: "powerline",
		label: "Power Line",
		cost: COST_POWER_LINE,
		color: Color3.fromRGB(255, 235, 59),
		shortcut: Enum.KeyCode.P,
		category: "utilities",
		shortcutLabel: "P",
	},
	{
		id: "coal_power",
		label: "Coal Power",
		cost: COST_COAL_POWER,
		color: Color3.fromRGB(66, 66, 66),
		shortcut: Enum.KeyCode.G,
		category: "utilities",
		shortcutLabel: "G",
	},
	// Services
	{
		id: "fire_station",
		label: "Fire Dept",
		cost: COST_FIRE_STATION,
		color: Color3.fromRGB(244, 67, 54),
		shortcut: Enum.KeyCode.F,
		category: "services",
		shortcutLabel: "F",
	},
	{
		id: "police_station",
		label: "Police Dept",
		cost: COST_POLICE_STATION,
		color: Color3.fromRGB(63, 81, 181),
		shortcut: Enum.KeyCode.O,
		category: "services",
		shortcutLabel: "O",
	},
	// Other
	{
		id: "park",
		label: "Park",
		cost: COST_PARK,
		color: Color3.fromRGB(56, 142, 60),
		shortcut: Enum.KeyCode.K,
		category: "other",
		shortcutLabel: "K",
	},
	{
		id: "bulldoze",
		label: "Bulldoze",
		cost: COST_BULLDOZE,
		color: Color3.fromRGB(255, 87, 34),
		shortcut: Enum.KeyCode.B,
		category: "other",
		shortcutLabel: "B",
	},
];

export function getToolsByCategory(category: ToolCategory): ToolDefinition[] {
	return TOOLS.filter((t) => t.category === category);
}
