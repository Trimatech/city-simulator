import Object from "@rbxts/object-utils";
import { store } from "server/store";
import { DEFAULT_ORBS, SOLDIER_TICK_PHASE } from "server/world/constants";
import {
	getAliveRealPlayers,
	getSafePointOutsideSoldierPolygons,
	getSpawnPointNearPlayer,
} from "server/world/world.utils";
import { SOLDIER_SPEED, WORLD_TICK } from "shared/constants/core";
import { getRandomBotSkin } from "shared/constants/skins";
import { selectAliveSoldiersById } from "shared/store/soldiers";
import { createScheduler } from "shared/utils/scheduler";

import { applyInitialPolygonClaim } from "../soldiers/soldier-claims";
import { soldierIsInsideChanged } from "../soldiers/soldier-events";
import { registerSoldierInput } from "../soldiers/soldier-tick";
import { setSoldierSpeed } from "../soldiers/soldiers.utils";
import { botStopped } from "./bot-events";
import { buildBotMovementPath } from "./buildBotMovementPath";

const MAX_BOTS_PER_PLAYER = 20;
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

async function spawnBot(botId: string) {
	// Find a player to spawn near
	const targetPlayerId = findPlayerWithAvailableSlot();

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
		name: `Bot ${botId}`,
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
		const bot = botControllers.get(id);
		if (bot && bot.waypoints.size() === 0) {
			const waypoints = buildBotMovementPath(bot.id, bot.position);
			bot.waypoints = waypoints;
			bot.waypointIndex = 1;
			// botMove.Fire(id, waypoints);
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
				const activeCooldowns = getActiveCooldownIds();
				const shortage = targetBots - aliveBots;
				const allowedToSpawn = math.max(0, shortage - activeCooldowns.size());
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
					// mark cooldown and clean up; respawn will be delayed by subscriber logic
					botRespawnCooldowns.set(controller.id, tick() + BOT_RESPAWN_DELAY);
					cleanupBot(controller.id);
					continue;
				}
				// state is updated by soldierIsInsideChanged; no polling needed here
				advanceBot(controller);
			}
		},
	});
}
