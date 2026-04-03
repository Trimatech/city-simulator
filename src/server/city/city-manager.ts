import { Players } from "@rbxts/services";
import {
	COST_BULLDOZE,
	COST_COAL_POWER,
	COST_COMMERCIAL,
	COST_INDUSTRIAL,
	COST_PARK,
	COST_POLICE_STATION,
	COST_FIRE_STATION,
	COST_POWER_LINE,
	COST_RAIL,
	COST_RESIDENTIAL,
	COST_ROAD,
	MAP_HEIGHT,
	MAP_WIDTH,
	STARTING_FUNDS,
} from "shared/constants/core";
import { remotes } from "shared/remotes";
import {
	BLBNCNBIT,
	BULLBIT,
	BURNBIT,
	COALBASE,
	COMCLR,
	CONDBIT,
	DIRT,
	FIRESTATION,
	FIRESTBASE,
	FREEZ,
	INDCLR,
	LOMASK,
	POLICESTATION,
	POLICESTBASE,
	POWERPLANT,
	ROADS,
	HRAIL,
	HPOWER,
	RUBBLE,
	tileType,
	WOODS,
	ZONEBIT,
	TREEBASE,
	LASTTREE,
	RIVER,
	LASTRIVEDGE,
} from "shared/simulation/tile-values";
import { store } from "server/store";

import { SimContext } from "./sim-context";

const cities = new Map<number, SimContext>();

export function getCity(player: Player): SimContext | undefined {
	return cities.get(player.UserId);
}

export function getAllCities(): Map<number, SimContext> {
	return cities;
}

function generateTerrain(ctx: SimContext): void {
	const map = ctx.tileMap;

	// Fill with trees and some open land
	for (let y = 0; y < MAP_HEIGHT; y++) {
		for (let x = 0; x < MAP_WIDTH; x++) {
			// Simple terrain: mostly dirt, some trees, a river
			const noise = math.noise(x * 0.05, y * 0.05, 42);
			const noise2 = math.noise(x * 0.1, y * 0.1, 99);

			if (noise2 > 0.3) {
				// Trees
				const treeVariant = math.floor(math.abs(noise * 10)) % (LASTTREE - TREEBASE + 1);
				map.setRaw(x, y, TREEBASE + treeVariant);
			} else if (noise < -0.35) {
				// River
				map.setRaw(x, y, RIVER);
			} else {
				// Dirt (empty land)
				map.setRaw(x, y, DIRT);
			}
		}
	}
}

function getToolCost(tool: string): number {
	switch (tool) {
		case "residential":
			return COST_RESIDENTIAL;
		case "commercial":
			return COST_COMMERCIAL;
		case "industrial":
			return COST_INDUSTRIAL;
		case "road":
			return COST_ROAD;
		case "rail":
			return COST_RAIL;
		case "powerline":
			return COST_POWER_LINE;
		case "fire_station":
			return COST_FIRE_STATION;
		case "police_station":
			return COST_POLICE_STATION;
		case "coal_power":
			return COST_COAL_POWER;
		case "park":
			return COST_PARK;
		case "bulldoze":
			return COST_BULLDOZE;
		default:
			return 0;
	}
}

function getToolTile(tool: string): number {
	switch (tool) {
		case "residential":
			return FREEZ | BLBNCNBIT | ZONEBIT;
		case "commercial":
			return COMCLR | BLBNCNBIT | ZONEBIT;
		case "industrial":
			return INDCLR | BLBNCNBIT | ZONEBIT;
		case "road":
			return ROADS | BULLBIT | BURNBIT;
		case "rail":
			return HRAIL | BULLBIT | BURNBIT;
		case "powerline":
			return HPOWER | CONDBIT | BULLBIT | BURNBIT;
		case "park":
			return WOODS | BULLBIT | BURNBIT;
		case "bulldoze":
			return DIRT;
		default:
			return DIRT;
	}
}

/** Get the size of multi-tile structures */
function getToolSize(tool: string): number {
	switch (tool) {
		case "residential":
		case "commercial":
		case "industrial":
			return 3; // 3x3 zones
		case "fire_station":
		case "police_station":
			return 3; // 3x3
		case "coal_power":
			return 4; // 4x4
		default:
			return 1; // 1x1
	}
}

function canPlaceTool(ctx: SimContext, tool: string, x: number, y: number): boolean {
	const toolSize = getToolSize(tool);

	// Check bounds
	if (x < 0 || y < 0 || x + toolSize > MAP_WIDTH || y + toolSize > MAP_HEIGHT) return false;

	// For multi-tile structures, check all tiles are clear
	if (toolSize > 1) {
		for (let dy = 0; dy < toolSize; dy++) {
			for (let dx = 0; dx < toolSize; dx++) {
				const t = tileType(ctx.tileMap.get(x + dx, y + dy));
				// Allow placement on dirt, trees, rubble
				if (t !== DIRT && (t < TREEBASE || t > LASTTREE) && (t < RUBBLE || t > RUBBLE + 3)) {
					return false;
				}
			}
		}
	} else if (tool === "bulldoze") {
		// Can bulldoze anything that isn't already dirt or water
		const t = tileType(ctx.tileMap.get(x, y));
		if (t === DIRT || (t >= RIVER && t <= LASTRIVEDGE)) return false;
	} else {
		// Single tile tools: must be empty, tree, or rubble
		const t = tileType(ctx.tileMap.get(x, y));
		if (t !== DIRT && (t < TREEBASE || t > LASTTREE) && (t < RUBBLE || t > RUBBLE + 3)) {
			return false;
		}
	}

	return true;
}

function placeMultiTile(
	ctx: SimContext,
	centerTile: number,
	baseTile: number,
	x: number,
	y: number,
	toolSize: number,
): void {
	// Place the base tiles first
	for (let dy = 0; dy < toolSize; dy++) {
		for (let dx = 0; dx < toolSize; dx++) {
			ctx.tileMap.set(x + dx, y + dy, baseTile + dy * toolSize + dx);
		}
	}
	// Set the center tile with zone bit
	const cx = x + math.floor(toolSize / 2);
	const cy = y + math.floor(toolSize / 2);
	ctx.tileMap.set(cx, cy, centerTile);
}

function handlePlaceTool(player: Player, tool: string, x: number, y: number): void {
	const ctx = getCity(player);
	if (!ctx) return;

	const cost = getToolCost(tool);
	const currentFunds = store.getState().budget.funds;

	if (currentFunds < cost) return;
	if (!canPlaceTool(ctx, tool, x, y)) return;

	const toolSize = getToolSize(tool);

	if (toolSize > 1) {
		// Multi-tile placement
		const toolTile = getToolTile(tool);
		let baseTile: number;
		switch (tool) {
			case "residential":
				baseTile = FREEZ - 4; // tiles before center
				break;
			case "commercial":
				baseTile = COMCLR - 4;
				break;
			case "industrial":
				baseTile = INDCLR - 4;
				break;
			case "fire_station":
				baseTile = FIRESTBASE;
				break;
			case "police_station":
				baseTile = POLICESTBASE;
				break;
			case "coal_power":
				baseTile = COALBASE;
				break;
			default:
				baseTile = DIRT;
		}
		placeMultiTile(ctx, toolTile, baseTile | BLBNCNBIT, x, y, toolSize);
		ctx.powerGridDirty = true;
	} else {
		// Single tile placement
		ctx.tileMap.set(x, y, getToolTile(tool));
		if (tool === "powerline" || tool === "bulldoze") {
			ctx.powerGridDirty = true;
		}
	}

	store.subtractFunds(cost);
}

function handleSetSpeed(player: Player, speed: number): void {
	const ctx = getCity(player);
	if (!ctx) return;
	const clamped = math.clamp(math.floor(speed), 0, 3) as SimSpeed;
	ctx.speed = clamped;
	store.setSimSpeed(clamped);
}

export function initCityManager(): void {
	Players.PlayerAdded.Connect((player) => {
		const ctx = new SimContext(player.UserId);
		generateTerrain(ctx);
		cities.set(player.UserId, ctx);

		// Set initial budget
		store.setFunds(STARTING_FUNDS);

		// Wait for client to request state, then hydrate map
		task.defer(() => {
			// Give client time to connect
			task.wait(1);
			if (player.Parent) {
				remotes.city.hydrateMap.fire(player, ctx.tileMap.serialize());
			}
		});
	});

	Players.PlayerRemoving.Connect((player) => {
		cities.delete(player.UserId);
	});

	// Handle tool placement requests
	remotes.city.placeTool.connect(handlePlaceTool);

	// Handle speed changes
	remotes.city.setSpeed.connect(handleSetSpeed);

	// Handle budget updates
	remotes.city.setBudget.connect((player, taxRate, roadFunding, policeFunding, fireFunding) => {
		const ctx = getCity(player);
		if (!ctx) return;
		store.setTaxRate(taxRate);
		store.setRoadFunding(roadFunding);
		store.setPoliceFunding(policeFunding);
		store.setFireFunding(fireFunding);
	});
}
