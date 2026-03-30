import Object from "@rbxts/object-utils";
import { store } from "server/store";
import { killSoldier, onPlayerDeath } from "server/world";
import {
	pauseBot,
	setBotFaceToward,
	setBotMoveToward,
	spawnBotsNearPlayer,
	unpauseBot,
} from "server/world/services/bots/bot-saga";
import { executePowerupForSoldier } from "server/world/services/powerups/powerups.service";
import { updateAreaGridForPolygon } from "server/world/services/soldiers/soldier-grid";
import { palette } from "shared/constants/palette";
import type { PowerupId } from "shared/constants/powerups";
import { isPointInPolygon, vector2ToPoint } from "shared/polybool/poly-utils";
import {
	calculatePolygonArea,
	createPolygonAroundPosition,
	createRectanglePolygon,
	scalePolygonFromCentroid,
} from "shared/polygon-extra.utils";
import { remotes } from "shared/remotes";
import { defaultPlayerSave } from "shared/store/saves";
import { selectSoldierById, selectSoldiers, selectSoldiersById } from "shared/store/soldiers";

import { createCommand } from "./create-command";
import { runScenarioCrowd, runScenarioNarrow, runScenarioTower } from "./scenarios";

function killSoldiersInsidePolygon(ownerId: string, polygon: Vector2[]) {
	const soldiers = store.getState(selectSoldiers);
	const polygonPoints = polygon.map(vector2ToPoint) as unknown as [number, number][];
	for (const soldier of soldiers) {
		if (soldier.dead || soldier.id === ownerId) continue;
		const testPoint = vector2ToPoint(soldier.position);
		if (isPointInPolygon(testPoint, polygonPoints)) {
			onPlayerDeath(soldier.id, ownerId, "area-grow");
		}
	}
}

const COMMAND_LIST: { cmd: string; desc: string }[] = [
	{ cmd: "/help, /commands", desc: "List all commands" },
	{ cmd: "/orbset [n]", desc: "Set orbs to n" },
	{ cmd: "/orbadd [n]", desc: "Add n orbs" },
	{ cmd: "/orbremove [n]", desc: "Remove n orbs" },
	{ cmd: "/moneyadd [n]", desc: "Add n to balance" },
	{ cmd: "/moneyremove [n]", desc: "Remove n from balance" },
	{ cmd: "/areagrow [x]", desc: "Add x studs to polygon area" },
	{ cmd: "/areashape [narrow]", desc: "Set polygon to preset shape" },
	{ cmd: "/botadd [n]", desc: "Add n bots (default 1)" },
	{ cmd: "/botgrow [id] [x]", desc: "Add x studs to bot area" },
	{ cmd: "/botarea [id] [shape]", desc: "Set bot polygon shape" },
	{ cmd: "/botstop [id]", desc: "Stop bot movement" },
	{ cmd: "/botgo [id]", desc: "Resume bot pathfinding" },
	{ cmd: "/botface [id]", desc: "Bot rotate toward you" },
	{ cmd: "/botcome [id]", desc: "Bot move toward you" },
	{ cmd: "/botpower [id] [powerup]", desc: "Bot use powerup (nuke, laser, shield, tower, turbo)" },
	{ cmd: "/scenario tower [n]", desc: "Tower + bots scenario" },
	{ cmd: "/scenario narrow", desc: "Narrow area cutting scenario" },
	{ cmd: "/scenario crowd", desc: "Big area, many bots scenario" },
	{ cmd: "/purge [bot]", desc: "Kill soldiers (or bots only)" },
	{ cmd: "/force-reset", desc: "Reset player save" },
];

function resolveBotId(argument: string, playerPosition: Vector2): string | undefined {
	const trimmed = trimArg(argument);
	if (trimmed.size() > 0) {
		const soldiers = store.getState(selectSoldiersById);
		const soldier = soldiers[trimmed];
		if (soldier && !soldier.dead && string.sub(trimmed, 1, 4) === "BOT_") {
			return trimmed;
		}
	}
	const soldiers = store.getState(selectSoldiersById);
	let nearestId: string | undefined;
	let nearestDist = math.huge;
	for (const [id, s] of Object.entries(soldiers)) {
		const idStr = tostring(id);
		if (!s || s.dead || string.sub(idStr, 1, 4) !== "BOT_") continue;
		const d = s.position.sub(playerPosition).Magnitude;
		if (d < nearestDist) {
			nearestDist = d;
			nearestId = idStr;
		}
	}
	return nearestId;
}

function getPlayerPosition(playerName: string): Vector2 | undefined {
	const soldier = store.getState(selectSoldierById(playerName));
	return soldier?.position;
}

const POWERUP_ALIASES: Record<string, PowerupId> = {
	nuke: "nuke",
	laser: "laserBeam",
	shield: "shield",
	tower: "tower",
	turbo: "turbo",
	nuclear: "nuke",
	nuclearexplosion: "nuke",
	laserbeam: "laserBeam",
};

const VALID_POWERUP_IDS: ReadonlySet<PowerupId> = new Set(["turbo", "shield", "tower", "laserBeam", "nuke"]);

function trimArg(s: string): string {
	const match = string.match(s, "^%s*(.-)%s*$");
	return (type(match) === "string" ? match : s) as string;
}

createCommand("/help", (player) => {
	const msg = COMMAND_LIST.map((c) => `${c.cmd}: ${c.desc}`).join("\n");
	remotes.client.alert.fire(player, {
		scope: "money",
		emoji: "📋",
		message: msg,
		color: palette.blue,
	});
});

createCommand("/commands", (player) => {
	const msg = COMMAND_LIST.map((c) => `${c.cmd}: ${c.desc}`).join("\n");
	remotes.client.alert.fire(player, {
		scope: "money",
		emoji: "📋",
		message: msg,
		color: palette.blue,
	});
});

createCommand("/orbset", (player, argument) => {
	const n = tonumber(argument);
	if (n !== undefined && n >= 0) {
		store.patchSoldier(player.Name, { orbs: n });
	}
});

createCommand("/orbadd", (player, argument) => {
	const n = tonumber(argument);
	if (n !== undefined && n >= 0) {
		store.incrementSoldierOrbs(player.Name, n);
	}
});

createCommand("/orbremove", (player, argument) => {
	const n = tonumber(argument);
	if (n !== undefined && n >= 0) {
		store.decrementSoldierOrbs(player.Name, n);
	}
});

createCommand("/moneyadd", (player, argument) => {
	const n = tonumber(argument) ?? 0;
	store.givePlayerBalance(player.Name, n);
});

createCommand("/moneyremove", (player, argument) => {
	const n = tonumber(argument) ?? 0;
	store.givePlayerBalance(player.Name, -n);
});

createCommand("/areagrow", (player, argument) => {
	const x = tonumber(argument);
	if (x === undefined || x <= 0) return;
	const soldier = store.getState(selectSoldierById(player.Name));
	if (!soldier || !soldier.polygon || soldier.polygon.size() < 3) return;
	const currentArea = soldier.polygonAreaSize ?? calculatePolygonArea(soldier.polygon);
	if (currentArea <= 0) return;
	const factor = math.sqrt((currentArea + x) / currentArea);
	const newPolygon = scalePolygonFromCentroid(soldier.polygon, factor);
	const newArea = calculatePolygonArea(newPolygon);
	store.setSoldierPolygon(player.Name, newPolygon, newArea, true);
	store.setSoldierPolygonAreaSize(player.Name, newArea);
	updateAreaGridForPolygon({ ownerId: player.Name, polygon: newPolygon });
	killSoldiersInsidePolygon(player.Name, newPolygon);
});

createCommand("/areashape", (player, argument) => {
	const shape = string.lower(trimArg(argument));
	const soldier = store.getState(selectSoldierById(player.Name));
	if (!soldier) return;
	const center = soldier.position;
	let polygon: Vector2[];
	if (shape === "narrow") {
		polygon = createRectanglePolygon(center, 5, 80);
	} else {
		polygon = createPolygonAroundPosition(center, 70, 40);
	}
	const area = calculatePolygonArea(polygon);
	store.setSoldierPolygon(player.Name, polygon, area, true);
	store.setSoldierPolygonAreaSize(player.Name, area);
	updateAreaGridForPolygon({ ownerId: player.Name, polygon });
});

createCommand("/botadd", (player, argument) => {
	const n = math.max(1, tonumber(argument) ?? 1);
	spawnBotsNearPlayer(player.Name, n);
});

createCommand("/botgrow", (player, argument) => {
	const pos = getPlayerPosition(player.Name);
	if (!pos) return;
	const parts = argument.split(" ");
	let botId: string | undefined;
	let x: number | undefined;
	if (parts.size() >= 2) {
		botId = resolveBotId(parts[0], pos);
		x = tonumber(parts[1]);
	} else if (parts.size() === 1) {
		const first = tonumber(parts[0]);
		if (first !== undefined) {
			x = first;
			botId = resolveBotId("", pos);
		}
	}
	if (!botId || x === undefined || x <= 0) return;
	const soldier = store.getState(selectSoldierById(botId));
	if (!soldier || !soldier.polygon || soldier.polygon.size() < 3) return;
	const currentArea = soldier.polygonAreaSize ?? calculatePolygonArea(soldier.polygon);
	if (currentArea <= 0) return;
	const factor = math.sqrt((currentArea + x) / currentArea);
	const newPolygon = scalePolygonFromCentroid(soldier.polygon, factor);
	const newArea = calculatePolygonArea(newPolygon);
	store.setSoldierPolygon(botId, newPolygon, newArea, true);
	store.setSoldierPolygonAreaSize(botId, newArea);
	updateAreaGridForPolygon({ ownerId: botId, polygon: newPolygon });
	killSoldiersInsidePolygon(botId, newPolygon);
});

createCommand("/botarea", (player, argument) => {
	const pos = getPlayerPosition(player.Name);
	if (!pos) return;
	const parts = argument.split(" ");
	let botId: string | undefined;
	let shape = "narrow";
	if (parts.size() >= 2) {
		botId = resolveBotId(parts[0], pos);
		shape = string.lower(trimArg(parts[1]));
	} else if (parts.size() === 1) {
		const first = trimArg(parts[0]);
		if (string.sub(first, 1, 4) === "BOT_") {
			botId = first;
		} else {
			botId = resolveBotId("", pos);
			shape = first;
		}
	}
	if (!botId) {
		spawnBotsNearPlayer(player.Name, 1);
		// Resolve again after spawn
		botId = resolveBotId("", pos);
	}
	if (!botId) return;
	const soldier = store.getState(selectSoldierById(botId));
	if (!soldier) return;
	const center = soldier.position;
	let polygon: Vector2[];
	if (shape === "narrow") {
		polygon = createRectanglePolygon(center, 5, 80);
	} else {
		polygon = createPolygonAroundPosition(center, 70, 40);
	}
	const area = calculatePolygonArea(polygon);
	store.setSoldierPolygon(botId, polygon, area, true);
	store.setSoldierPolygonAreaSize(botId, area);
	updateAreaGridForPolygon({ ownerId: botId, polygon });
});

createCommand("/botstop", (player, argument) => {
	const pos = getPlayerPosition(player.Name);
	if (!pos) return;
	const botId = resolveBotId(argument, pos);
	if (botId) pauseBot(botId);
});

createCommand("/botgo", (player, argument) => {
	const pos = getPlayerPosition(player.Name);
	if (!pos) return;
	const botId = resolveBotId(argument, pos);
	if (botId) unpauseBot(botId);
});

createCommand("/botface", (player, argument) => {
	const pos = getPlayerPosition(player.Name);
	if (!pos) return;
	const botId = resolveBotId(argument, pos);
	if (botId) setBotFaceToward(botId, pos);
});

createCommand("/botcome", (player, argument) => {
	const pos = getPlayerPosition(player.Name);
	if (!pos) return;
	const botId = resolveBotId(argument, pos);
	if (botId) setBotMoveToward(botId, pos);
});

createCommand("/botpower", (player, argument) => {
	const pos = getPlayerPosition(player.Name);
	if (!pos) return;
	const parts = argument.split(" ");
	let botId: string | undefined;
	let powerupRaw = "";
	if (parts.size() >= 2) {
		botId = resolveBotId(parts[0], pos);
		powerupRaw = string.lower(trimArg(parts[1]));
	} else if (parts.size() === 1) {
		powerupRaw = string.lower(trimArg(parts[0]));
		if (string.sub(powerupRaw, 1, 4) === "BOT_") {
			botId = powerupRaw;
			powerupRaw = "";
		} else {
			botId = resolveBotId("", pos);
		}
	}
	const powerupId = (POWERUP_ALIASES[powerupRaw] ?? powerupRaw) as PowerupId;
	if (!botId || !VALID_POWERUP_IDS.has(powerupId)) return;
	const botSoldier = store.getState(selectSoldierById(botId));
	if (!botSoldier) return;
	const directionToward = pos.sub(botSoldier.position);
	executePowerupForSoldier(botId, powerupId, {
		skipCost: true,
		directionToward: directionToward.Magnitude > 0.001 ? directionToward : new Vector2(0, 1),
	});
});

createCommand("/scenario", (player, argument) => {
	const parts = trimArg(argument).split(" ");
	const sub = parts[0] ? string.lower(parts[0]) : "";
	if (sub === "tower") {
		const n = tonumber(parts[1]) ?? 3;
		runScenarioTower(player, n);
	} else if (sub === "narrow") {
		runScenarioNarrow(player);
	} else if (sub === "crowd") {
		runScenarioCrowd(player);
	}
});

createCommand("/purge", (player, argument) => {
	let soldiers = store.getState(selectSoldiers).filter((soldier) => soldier.id !== player.Name);

	const argTrimmed = string.lower(trimArg(argument));
	if (string.sub(argTrimmed, 1, 3) === "bot") {
		soldiers = soldiers.filter((soldier) => string.sub(soldier.id, 1, 4) === "BOT_");
	}

	for (const soldier of soldiers) {
		killSoldier(soldier.id);
	}
});

createCommand("/force-reset", (player) => {
	store.setPlayerSave(player.Name, defaultPlayerSave);
});
