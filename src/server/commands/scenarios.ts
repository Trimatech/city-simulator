import Object from "@rbxts/object-utils";
import { store } from "server/store";
import { spawnBotsNearPlayer } from "server/world/services/bots/bot-saga";
import {
	createPolygonAroundPosition,
	createRectanglePolygon,
	calculatePolygonArea,
} from "shared/polygon-extra.utils";
import { INITIAL_POLYGON_DIAMETER, INITIAL_POLYGON_ITEMS } from "shared/constants/core";
import { selectSoldiersById } from "shared/store/soldiers";
import { selectTowersById } from "shared/store/towers/tower-selectors";
import { getSafePointOutsideSoldierPolygons, killSoldier } from "server/world/world.utils";
import { updateAreaGridForPolygon } from "server/world/services/soldiers/soldier-grid";
import { findCharacterPrimaryPart } from "shared/utils/player-utils";

const CHARACTER_SPAWN_Y = 100;
/** Player spawn offset from tower at origin - inside tower range (50) so player is affected by attacks */
const TOWER_SCENARIO_PLAYER_OFFSET = 35;
/** Owner id for scenario tower - not a real soldier, so tower attacks everyone including the player */
const TOWER_SCENARIO_ENEMY_OWNER = "SCENARIO_TOWER_ENEMY";

function teleportPlayerCharacterTo(player: Player, position: Vector2) {
	const character = player.Character;
	if (!character || !character.IsA("Model")) return;
	const primaryPart = findCharacterPrimaryPart(character);
	if (primaryPart) {
		character.PivotTo(new CFrame(position.X, CHARACTER_SPAWN_Y, position.Y));
	}
}

function purgeAllSoldiersExcept(playerName: string) {
	const soldiers = store.getState(selectSoldiersById);
	for (const [id, soldier] of Object.entries(soldiers)) {
		if (soldier && tostring(id) !== playerName) {
			killSoldier(tostring(id));
		}
	}
}

function purgeAllTowers() {
	const towers = store.getState(selectTowersById);
	for (const [id] of Object.entries(towers)) {
		store.removeTower(tostring(id));
	}
}

function purgeAll(playerName: string) {
	purgeAllSoldiersExcept(playerName);
	purgeAllTowers();
}

export async function runScenarioTower(player: Player, botCount = 3) {
	const playerName = player.Name;
	purgeAll(playerName);

	const soldier = store.getState(selectSoldiersById)[playerName];
	if (!soldier) return;

	// Place player near tower at origin - fixed position for consistent testing
	const playerPos = new Vector2(TOWER_SCENARIO_PLAYER_OFFSET, 0);
	const freshPolygon = createPolygonAroundPosition(playerPos, INITIAL_POLYGON_DIAMETER, INITIAL_POLYGON_ITEMS);
	const area = calculatePolygonArea(freshPolygon);

	store.setSoldierPolygon(playerName, freshPolygon, area, true);
	store.setSoldierPolygonAreaSize(playerName, area);
	store.patchSoldier(playerName, { orbs: 500, position: playerPos });
	teleportPlayerCharacterTo(player, playerPos);
	updateAreaGridForPolygon({ ownerId: playerName, polygon: freshPolygon });

	const towerPos = new Vector2(0, 0);
	store.placeTower({
		id: `scenario_tower_${tick()}`,
		position: towerPos,
		ownerId: TOWER_SCENARIO_ENEMY_OWNER,
		damage: 15,
		range: 50,
		lastAttackTime: 0,
		lastAttackPlayerName: undefined,
		currentTargetId: undefined,
		hasEnemyInRange: false,
	});

	await spawnBotsNearPlayer(playerName, botCount);
}

export async function runScenarioNarrow(player: Player) {
	const playerName = player.Name;
	purgeAll(playerName);

	const safePoint = getSafePointOutsideSoldierPolygons();
	if (!safePoint) return;

	const soldier = store.getState(selectSoldiersById)[playerName];
	if (!soldier) return;

	const narrowPolygon = createRectanglePolygon(safePoint, 5, 80);
	const area = calculatePolygonArea(narrowPolygon);
	store.setSoldierPolygon(playerName, narrowPolygon, area, true);
	store.setSoldierPolygonAreaSize(playerName, area);
	store.patchSoldier(playerName, { position: safePoint });
	teleportPlayerCharacterTo(player, safePoint);
	updateAreaGridForPolygon({ ownerId: playerName, polygon: narrowPolygon });

	await spawnBotsNearPlayer(playerName, 1);

	const soldiersById = store.getState(selectSoldiersById);
	let botSoldier: (typeof soldiersById)[string] | undefined;
	for (const [id, s] of Object.entries(soldiersById)) {
		if (string.sub(tostring(id), 1, 4) === "BOT_" && s) {
			botSoldier = s;
			break;
		}
	}
	if (botSoldier !== undefined) {
		const botCenter = botSoldier.position;
		const botNarrow = createRectanglePolygon(botCenter, 5, 80);
		const botArea = calculatePolygonArea(botNarrow);
		store.setSoldierPolygon(botSoldier.id, botNarrow, botArea, true);
		store.setSoldierPolygonAreaSize(botSoldier.id, botArea);
		updateAreaGridForPolygon({ ownerId: botSoldier.id, polygon: botNarrow });
	}
}

export async function runScenarioCrowd(player: Player) {
	const playerName = player.Name;
	purgeAll(playerName);

	const safePoint = getSafePointOutsideSoldierPolygons();
	if (!safePoint) return;

	const soldier = store.getState(selectSoldiersById)[playerName];
	if (!soldier) return;

	const largePolygon = createPolygonAroundPosition(safePoint, 200, 40);
	const area = calculatePolygonArea(largePolygon);
	store.setSoldierPolygon(playerName, largePolygon, area, true);
	store.setSoldierPolygonAreaSize(playerName, area);
	store.patchSoldier(playerName, { position: safePoint });
	teleportPlayerCharacterTo(player, safePoint);
	updateAreaGridForPolygon({ ownerId: playerName, polygon: largePolygon });

	await spawnBotsNearPlayer(playerName, 10);
}
