import { Players } from "@rbxts/services";
import { waitForPrimaryPart } from "@rbxts/wait-for";
import { store } from "server/store";
import { IS_TESTING_STUFF, SOLDIER_TICK_PHASE } from "server/world/constants";
import { getSafePointInWorld } from "server/world/world.utils";
import { SOLDIER_SPEED, WORLD_TICK } from "shared/constants/core";
import { createScheduler } from "shared/utils/scheduler";

import { soldierIsInsideChanged } from "../soldiers/soldier-events";
import { registerSoldierInput } from "../soldiers/soldier-tick";
import { setSoldierSpeed } from "../soldiers/soldiers.utils";
import { botStopped } from "./bot-events";
import { buildBotMovementPath } from "./buildBotMovementPath";

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

function chooseRandomPlayer(): Player | undefined {
	const players = Players.GetPlayers();
	if (players.size() === 0) {
		return undefined;
	}
	const random = new Random();
	return players[random.NextInteger(1, players.size()) - 1];
}

async function spawnBot(botId: string) {
	let spawnPoint = getSafePointInWorld();

	if (IS_TESTING_STUFF) {
		const sourcePlayer = chooseRandomPlayer();
		if (!sourcePlayer || !sourcePlayer.Character) {
			warn(`No source player or character found for bot ${botId}`);
			return;
		}

		const sourceCharacter = sourcePlayer.Character;

		const primaryPart2 = await waitForPrimaryPart(sourceCharacter);
		const pos = primaryPart2?.Position;
		if (!pos) {
			warn(`No position found for bot ${botId}`);
			return;
		}
		spawnPoint = new Vector2(pos.X, pos.Z);

		//characterClone.PivotTo(new CFrame(pos.X, 10, pos.Z));
		warn(`Bot ${botId} pivoted to primary part position`, pos);
	} else {
		//characterClone.PivotTo(new CFrame(spawnPoint.X, 10, spawnPoint.Y));
		warn(`Bot ${botId} pivoted to spawn point`);
	}

	// create soldier entity in store
	store.addSoldier(botId, {
		name: `Bot ${botId}`,
		position: spawnPoint,
		lastPosition: spawnPoint,
		orbs: 10,
	});
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

	task.delay(5, () => {
		spawnBot("BOT_1");
	});

	// tick bot logic alongside soldiers
	createScheduler({
		name: "bots",
		tick: WORLD_TICK,
		phase: SOLDIER_TICK_PHASE,
		onTick: () => {
			for (const [, controller] of botControllers) {
				const entity = store.getState((state) => state.soldiers[controller.id]);
				if (!entity || entity.dead) {
					// clean up and optionally respawn later
					cleanupBot(controller.id);
					continue;
				}
				// state is updated by soldierIsInsideChanged; no polling needed here
				advanceBot(controller);
			}
		},
	});
}
