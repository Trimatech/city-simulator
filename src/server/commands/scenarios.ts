import Object from "@rbxts/object-utils";
import { store } from "server/store";
import { spawnBotsNearPlayer } from "server/world/services/bots/bot-saga";
import {
	createPolygonAroundPosition,
	createRectanglePolygon,
	calculatePolygonArea,
} from "shared/polygon-extra.utils";
import { selectSoldiersById } from "shared/store/soldiers";
import { selectTowersById } from "shared/store/towers/tower-selectors";
import { getSafePointOutsideSoldierPolygons, killSoldier } from "server/world/world.utils";
import { updateAreaGridForPolygon } from "server/world/services/soldiers/soldier-grid";

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

export async function runScenarioTower(playerName: string, botCount = 3) {
	purgeAll(playerName);

	const safePoint = getSafePointOutsideSoldierPolygons();
	if (!safePoint) return;

	store.patchSoldier(playerName, { orbs: 500 });
	store.patchSoldier(playerName, { position: safePoint });

	const towerPos = new Vector2(0, 0);
	store.placeTower({
		id: `scenario_tower_${tick()}`,
		position: towerPos,
		ownerId: playerName,
		damage: 15,
		range: 50,
		lastAttackTime: 0,
		lastAttackPlayerName: undefined,
		currentTargetId: undefined,
		hasEnemyInRange: false,
	});

	await spawnBotsNearPlayer(playerName, botCount);
}

export async function runScenarioNarrow(playerName: string) {
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

export async function runScenarioCrowd(playerName: string) {
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
	updateAreaGridForPolygon({ ownerId: playerName, polygon: largePolygon });

	await spawnBotsNearPlayer(playerName, 10);
}
