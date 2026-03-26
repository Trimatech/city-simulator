import Object from "@rbxts/object-utils";
import { store } from "server/store";
import { DEFAULT_ORBS, SOLDIER_TICK_PHASE } from "server/world/constants";
import {
	getAliveRealPlayers,
	getSafePointOutsideSoldierPolygons,
	getSpawnPointNearPlayer,
} from "server/world/world.utils";
import { DEATH_CHOICE_TIMEOUT_SEC, SOLDIER_SPEED, WORLD_TICK } from "shared/constants/core";
import { getRandomBotSkin } from "shared/constants/skins";
import { selectAliveSoldiersById, selectSoldiersById } from "shared/store/soldiers";
import { createScheduler } from "shared/utils/scheduler";

import { getRandomBotName } from "../bots/bot-names";
import { applyInitialPolygonClaim } from "../soldiers/soldier-claims";
import { soldierIsInsideChanged } from "../soldiers/soldier-events";
import { registerSoldierInput } from "../soldiers/soldier-tick";
import { setSoldierSpeed } from "../soldiers/soldiers.utils";
import { botStopped } from "./bot-events";
import { buildBotMovementPath } from "./buildBotMovementPath";

const MAX_BOTS_PER_PLAYER = 2;
const BOT_RESPAWN_DELAY = 2; // seconds to wait before replacing a dead bot

// Track which player each bot is assigned to
const botToPlayerMap = new Map<string, string>();

interface BotController {
	readonly id: string;
	position: Vector2;
	waypoints: Vector2[];
	waypointIndex: number;
	speed: number;
	wasInside: boolean;
	lastDirection: Vector2;
}

const botControllers = new Map<string, BotController>();
const botRespawnCooldowns = new Map<string, number>();
const botPausedIds = new Set<string>();

function getActiveCooldownIds(): string[] {
	const now = tick();
	const active: string[] = [];
	for (const [id, expiresAt] of botRespawnCooldowns) {
		if (expiresAt > now) active.push(id);
		else botRespawnCooldowns.delete(id);
	}
	return active;
}

/**
 * Get the count of bots assigned to each player
 */
function getBotsPerPlayer(): Map<string, number> {
	const counts = new Map<string, number>();
	const aliveBotIds = getAliveBotIds();

	for (const botId of aliveBotIds) {
		const playerId = botToPlayerMap.get(botId);
		if (playerId !== undefined) {
			counts.set(playerId, (counts.get(playerId) ?? 0) + 1);
		}
	}

	return counts;
}

/**
 * Find a player that has fewer than MAX_BOTS_PER_PLAYER bots assigned
 */
function findPlayerWithAvailableSlot(): string | undefined {
	const realPlayers = getAliveRealPlayers();
	if (realPlayers.size() === 0) return undefined;

	const botsPerPlayer = getBotsPerPlayer();

	// Find players with available slots, prefer players with fewer bots
	const playersWithSlots = realPlayers
		.map((playerId) => ({
			playerId,
			botCount: botsPerPlayer.get(playerId) ?? 0,
		}))
		.filter((p) => p.botCount < MAX_BOTS_PER_PLAYER)
		.sort((a, b) => a.botCount < b.botCount);

	return playersWithSlots.size() > 0 ? playersWithSlots[0].playerId : undefined;
}

async function spawnBot(botId: string, forceTargetPlayerId?: string) {
	// Find a player to spawn near
	const targetPlayerId = forceTargetPlayerId ?? findPlayerWithAvailableSlot();

	let spawnPoint: Vector2;

	if (targetPlayerId !== undefined) {
		// Try to spawn near the target player (60-200 studs from their polygon bounding box)
		const nearPlayerSpawn = getSpawnPointNearPlayer(targetPlayerId);
		if (nearPlayerSpawn !== undefined) {
			spawnPoint = nearPlayerSpawn;
			botToPlayerMap.set(botId, targetPlayerId);
			print(`Bot ${botId} spawning near player ${targetPlayerId} at`, spawnPoint);
		} else {
			// Fallback to safe point if couldn't find valid spawn near player
			spawnPoint = getSafePointOutsideSoldierPolygons();
			botToPlayerMap.set(botId, targetPlayerId);
			print(`Bot ${botId} fallback spawn (couldn't find spot near player) at`, spawnPoint);
		}
	} else {
		// No players with available slots, use regular spawn
		spawnPoint = getSafePointOutsideSoldierPolygons();
		print(`Bot ${botId} spawning at random point (no players available)`, spawnPoint);
	}

	// create soldier entity in store
	const randomSkinId = getRandomBotSkin().id;
	print(`Bot ${botId} using skin ${randomSkinId}`);
	store.addSoldier(botId, {
		name: getRandomBotName(),
		position: spawnPoint,
		lastPosition: spawnPoint,
		orbs: DEFAULT_ORBS,
		skin: randomSkinId,
	});

	// Apply initial polygon claim through the same cutting logic as updates
	applyInitialPolygonClaim(botId);
	// ensure walk speed matches soldiers
	setSoldierSpeed(botId, SOLDIER_SPEED);
	// initialize controller via events
	botControllers.set(botId, {
		id: botId,
		position: spawnPoint,
		waypoints: [],
		waypointIndex: 0,
		speed: SOLDIER_SPEED,
		wasInside: true,
		lastDirection: new Vector2(0, 1),
	});
	botStopped.Fire(botId);
}

function advanceBot(bot: BotController) {
	if (bot.waypoints.size() === 0) {
		warn(`No waypoints found for bot ${bot.id}`);
		return;
	}

	const target = bot.waypoints[bot.waypointIndex];
	const delta = target.sub(bot.position);
	const distance = delta.Magnitude;
	const step = bot.speed * WORLD_TICK;

	if (distance <= step) {
		// arrive at waypoint
		bot.position = target;
		bot.waypointIndex = (bot.waypointIndex + 1) % bot.waypoints.size();

		// if we completed the rectangle, signal stop to plan new path next tick
		if (bot.waypointIndex === 0) {
			bot.waypoints = [];
			botStopped.Fire(bot.id);
		}
	} else {
		const direction = distance > 0 ? delta.div(distance) : new Vector2();
		bot.position = bot.position.add(direction.mul(step));
		if (direction.Magnitude > 0.0001) {
			bot.lastDirection = direction;
		}
	}

	// drive soldier movement + model
	registerSoldierInput(bot.id, bot.position);

	// Client handles model movement, rotation, and animation for bots via tweens
}

function cleanupBot(botId: string) {
	botControllers.delete(botId);
	botToPlayerMap.delete(botId);
	botPausedIds.delete(botId);
}

function getAliveBotIds(): string[] {
	const aliveById = store.getState(selectAliveSoldiersById);
	const ids: string[] = [];
	for (const rawId of Object.keys(aliveById as unknown as { [id: string]: unknown })) {
		const id = tostring(rawId);
		if (string.sub(id, 1, 4) === "BOT_") ids.push(id);
	}
	ids.sort((a, b) => tonumber(string.sub(a, 5))! < tonumber(string.sub(b, 5))!);
	return ids;
}

function getAliveNonBotCount(): number {
	const aliveById = store.getState(selectAliveSoldiersById);
	let count = 0;
	for (const rawId of Object.keys(aliveById as unknown as { [id: string]: unknown })) {
		const id = tostring(rawId);
		if (string.sub(id, 1, 4) !== "BOT_") count += 1;
	}
	return count;
}

function getDeadBotCount(): number {
	const soldiersById = store.getState(selectSoldiersById);
	let count = 0;
	for (const rawId of Object.keys(soldiersById as unknown as { [id: string]: unknown })) {
		const id = tostring(rawId);
		if (string.sub(id, 1, 4) === "BOT_" && soldiersById[id]?.dead) count += 1;
	}
	return count;
}

function nextBotId(existing: ReadonlyArray<string>): string {
	let index = existing.size() > 0 ? tonumber(string.sub(existing[existing.size() - 1], 5))! + 1 : 1;
	let id = `BOT_${index}`;
	while (existing.includes(id)) {
		index += 1;
		id = `BOT_${index}`;
	}
	return id;
}

async function spawnBots(amount: number) {
	let remaining = amount;
	while (remaining > 0) {
		const existing = [...getAliveBotIds(), ...getActiveCooldownIds()];
		const id = nextBotId(existing);
		await spawnBot(id);
		remaining -= 1;
	}
}

export async function spawnBotsNearPlayer(playerName: string, count: number) {
	let remaining = math.max(1, count);
	while (remaining > 0) {
		const existing = [...getAliveBotIds(), ...getActiveCooldownIds()];
		const id = nextBotId(existing);
		await spawnBot(id, playerName);
		remaining -= 1;
	}
}

export function pauseBot(botId: string) {
	botPausedIds.add(botId);
	const controller = botControllers.get(botId);
	if (controller) {
		controller.waypoints = [];
		controller.waypointIndex = 0;
	}
}

export function unpauseBot(botId: string) {
	botPausedIds.delete(botId);
	botStopped.Fire(botId);
}

export function setBotMoveToward(botId: string, targetPosition: Vector2) {
	botPausedIds.delete(botId);
	const controller = botControllers.get(botId);
	if (!controller) return;
	const currentPos = store.getState((s) => s.soldiers[botId]?.position ?? controller.position);
	controller.waypoints = [currentPos, targetPosition];
	controller.waypointIndex = 1;
}

export function setBotFaceToward(botId: string, targetPosition: Vector2) {
	const soldier = store.getState((s) => s.soldiers[botId]);
	if (!soldier) return;
	const pos = soldier.position;
	const dy = targetPosition.Y - pos.Y;
	const dx = targetPosition.X - pos.X;
	const desiredAngle = math.atan2(dy, dx);
	store.patchSoldier(botId, { desiredAngle });
}

export async function initBotService() {
	// React to inside-state changes
	soldierIsInsideChanged.Connect((id, isInside) => {
		const controller = botControllers.get(id);
		if (!controller) return;
		if (isInside && controller.waypoints.size() > 0) {
			controller.waypoints = [];
			controller.waypointIndex = 0;
			botStopped.Fire(id);
		}
		controller.wasInside = isInside;
	});

	botStopped.Connect((id) => {
		if (botPausedIds.has(id)) return;
		const bot = botControllers.get(id);
		if (bot && bot.waypoints.size() === 0) {
			const waypoints = buildBotMovementPath(bot.id, bot.position);
			bot.waypoints = waypoints;
			bot.waypointIndex = 1;
		}
	});

	// Maintain dynamic bot count: max 2 bots per real player
	store.subscribe(
		selectAliveSoldiersById,
		() => true,
		(_aliveById) => {
			const aliveBotIds = getAliveBotIds();
			const aliveBots = aliveBotIds.size();
			const aliveNonBots = getAliveNonBotCount();

			// No humans alive -> remove all bots (conserve resources)
			// if (aliveNonBots === 0) {
			// 	if (aliveBots > 0) {
			// 		for (const id of aliveBotIds) {
			// 			print(`Killing bot ${id} because no players are alive`);
			// 			killSoldier(id);
			// 		}
			// 	}
			// 	return;
			// }

			// Target bots = MAX_BOTS_PER_PLAYER * number of real players
			const targetBots = aliveNonBots * MAX_BOTS_PER_PLAYER;

			if (aliveBots < targetBots) {
				// Dead bots still in the store (waiting for revive timeout) count as occupied slots
				const deadBots = getDeadBotCount();
				const activeCooldowns = getActiveCooldownIds();
				const shortage = targetBots - aliveBots;
				const allowedToSpawn = math.max(0, shortage - deadBots - activeCooldowns.size());
				if (allowedToSpawn > 0) {
					spawnBots(allowedToSpawn);
				}
				return;
			}

			// if (aliveBots > targetBots) {
			// 	const extras = aliveBots - targetBots;
			// 	const start = aliveBotIds.size() - extras;
			// 	const toKill = aliveBotIds.move(start, aliveBotIds.size() - 1, 0, [] as string[]);
			// 	for (const id of toKill) {
			// 		print(`Killing bot ${id} because there are too many bots`);
			// 		killSoldier(id);
			// 	}
			// }
		},
	);

	// tick bot logic alongside soldiers
	createScheduler({
		name: "bots",
		tick: WORLD_TICK,
		phase: SOLDIER_TICK_PHASE,
		onTick: () => {
			for (const [, controller] of botControllers) {
				const entity = store.getState((state) => state.soldiers[controller.id]);
				if (!entity || entity.dead) {
					// Keep bot around for the full revive duration like players, then add respawn delay
					botRespawnCooldowns.set(controller.id, tick() + DEATH_CHOICE_TIMEOUT_SEC + BOT_RESPAWN_DELAY);
					cleanupBot(controller.id);
					continue;
				}
				// state is updated by soldierIsInsideChanged; no polling needed here
				advanceBot(controller);
			}
		},
	});
}
