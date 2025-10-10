import { CollectionService, Players, Workspace } from "@rbxts/services";
import { waitForPrimaryPart } from "@rbxts/wait-for";
import { store } from "server/store";
import { IS_TESTING_STUFF, SOLDIER_TICK_PHASE } from "server/world/constants";
import { getSafePointInWorld } from "server/world/world.utils";
import { CollisionGroups } from "shared/constants/collision-groups";
import { SOLDIER_SPEED, WORLD_TICK } from "shared/constants/core";
import { createScheduler } from "shared/utils/scheduler";

import { soldierIsInsideChanged } from "../soldiers/soldier-events";
import { registerSoldierInput } from "../soldiers/soldier-tick";
import { setSoldierSpeed } from "../soldiers/soldiers.utils";
import { botStopped } from "./bot-events";
import { registerBotCharacter, unregisterBot } from "./bot-registry";
import { buildBotMovementPath } from "./buildBotMovementPath";

interface BotController {
	readonly id: string;
	position: Vector2;
	waypoints: Vector2[];
	waypointIndex: number;
	speed: number;
	wasInside: boolean;
	groundY: number;
	groundUpdateTicker: number;
	animator?: Animator;
	runTrack?: AnimationTrack;
	lastDirection: Vector2;
}

const botControllers = new Map<string, BotController>();

// Sample ground every ~0.5s (low-cost)
const GROUND_SAMPLE_INTERVAL_TICKS = math.max(1, math.floor(0.5 / WORLD_TICK));

const FALLBACK_GROUND_Y = 2;
const GROUND_TAG = "ground";

function getCharacterGroundOffset(character: Model): number {
	// Estimate distance from model pivot (usually HRP center) to feet contact point
	const humanoid = character.FindFirstChildOfClass("Humanoid");
	const hrp = character.FindFirstChild("HumanoidRootPart");
	let offset = 2; // sensible default
	if (humanoid) {
		offset = humanoid.HipHeight;
	}
	if (hrp && hrp.IsA("BasePart")) {
		offset += hrp.Size.Y * 0.5;
	}
	return offset;
}

function findRunAnimation(character: Model): Animation | undefined {
	// Prefer any Animation descendant with name that includes "run"
	let candidate: Animation | undefined = undefined;
	character.GetDescendants().forEach((inst) => {
		if (inst.IsA("Animation")) {
			const name = string.lower(inst.Name);
			if (string.find(name, "run")[0] !== undefined) {
				candidate = inst;
			}
		}
	});
	return candidate;
}

function ensureRunTrack(controller: BotController, character: Model): AnimationTrack | undefined {
	if (controller.runTrack && controller.animator) {
		return controller.runTrack;
	}
	const humanoid = character.FindFirstChildOfClass("Humanoid");
	if (!humanoid) return undefined;
	let animator = humanoid.FindFirstChildOfClass("Animator");
	if (!animator) {
		animator = new Instance("Animator");
		animator.Parent = humanoid;
	}
	const runAnim = findRunAnimation(character);
	if (!runAnim) return undefined;
	const track = animator.LoadAnimation(runAnim);
	controller.animator = animator;
	controller.runTrack = track;
	return track;
}

function sampleGroundYAt(position: Vector2): number {
	// Cast from high above downwards to find the ground
	const origin = new Vector3(position.X, 2048, position.Y);
	const direction = new Vector3(0, -8192, 0);
	const params = new RaycastParams();
	// Only consider parts tagged as ground
	params.FilterType = Enum.RaycastFilterType.Include;
	params.FilterDescendantsInstances = CollectionService.GetTagged(GROUND_TAG);
	const result = Workspace.Raycast(origin, direction, params);
	if (result) {
		return result.Position.Y;
	}
	warn(`No ground found at ${position}`);
	return FALLBACK_GROUND_Y; // fallback height
}

function chooseRandomPlayer(): Player | undefined {
	const players = Players.GetPlayers();
	if (players.size() === 0) {
		return undefined;
	}
	const random = new Random();
	return players[random.NextInteger(1, players.size()) - 1];
}

function setModelCollisionGroup(model: Model, groupName: string) {
	model.GetDescendants().forEach((instance) => {
		if (instance.IsA("BasePart")) {
			instance.CollisionGroup = groupName;
		}
	});
}

async function spawnBotFromRandomPlayer(botId: string) {
	warn(`Spawning bot ${botId} from random player`);
	const sourcePlayer = chooseRandomPlayer();
	if (!sourcePlayer || !sourcePlayer.Character) {
		warn(`No source player or character found for bot ${botId}`);
		return;
	}

	const sourceCharacter = sourcePlayer.Character;
	const prevArchivable = sourceCharacter.Archivable;
	sourceCharacter.Archivable = true;
	const characterClone = sourceCharacter.Clone();
	sourceCharacter.Archivable = prevArchivable;
	if (!characterClone) {
		warn(`No character clone found for bot ${botId}`);
		return;
	}
	characterClone.Name = botId;
	characterClone.Parent = Workspace;

	// ensure primary part exists
	const primaryPart = await waitForPrimaryPart(characterClone);
	if (!primaryPart) {
		characterClone.Destroy();
		warn(`No primary part found for bot ${botId}`);
		return;
	}

	// register bot character for damage/speed utilities
	registerBotCharacter(botId, characterClone);

	// position at a safe spawn
	let spawnPoint = getSafePointInWorld();
	if (IS_TESTING_STUFF) {
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
	setModelCollisionGroup(characterClone, CollisionGroups.PLAYER);

	// create soldier entity in store
	store.addSoldier(botId, {
		name: `Bot ${botId}`,
		position: spawnPoint,
		lastPosition: spawnPoint,
		orbs: 10,
	});
	warn(`Bot ${botId} added to store`);

	// ensure walk speed matches soldiers
	setSoldierSpeed(botId, SOLDIER_SPEED);
	warn(`Bot ${botId} set speed`);
	// initialize controller via events
	botControllers.set(botId, {
		id: botId,
		position: spawnPoint,
		waypoints: [],
		waypointIndex: 0,
		speed: SOLDIER_SPEED,
		wasInside: true,
		groundY: sampleGroundYAt(spawnPoint),
		groundUpdateTicker: 0,
		animator: undefined,
		runTrack: undefined,
		lastDirection: new Vector2(0, 1),
	});
	botStopped.Fire(botId);
	warn(`Bot ${botId} spawned`);
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

	const character = Workspace.FindFirstChild(bot.id);
	if (character && character.IsA("Model")) {
		// lazily resample ground height every ~0.5s to keep on ground
		bot.groundUpdateTicker += 1;
		if (bot.groundUpdateTicker >= GROUND_SAMPLE_INTERVAL_TICKS) {
			bot.groundY = sampleGroundYAt(bot.position);
			bot.groundUpdateTicker = 0;
		}

		const verticalOffset = getCharacterGroundOffset(character);
		const from = new Vector3(bot.position.X, bot.groundY + verticalOffset, bot.position.Y);
		const dir = bot.lastDirection.Magnitude > 0.0001 ? bot.lastDirection : new Vector2(0, 1);
		const lookAt = from.add(new Vector3(dir.X, 0, dir.Y));
		character.PivotTo(CFrame.lookAt(from, lookAt));

		// play/stop run animation depending on velocity
		const moving = distance > 0.1;
		const runTrack = ensureRunTrack(bot, character);
		if (runTrack) {
			if (moving) {
				if (runTrack.IsPlaying === false) runTrack.Play(0.1);
				// Adjust speed to match walk speed (tracks default speed is 1)
				// Use a simple mapping: speed/16 as baseline
				runTrack.AdjustSpeed(math.max(bot.speed / 16, 0.1));
			} else {
				if (runTrack.IsPlaying) runTrack.Stop(0.2);
			}
		}
	}
}

function cleanupBot(botId: string) {
	unregisterBot(botId);
	const character = Workspace.FindFirstChild(botId);
	if (character && character.IsA("Model")) {
		character.Destroy();
	}
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
		spawnBotFromRandomPlayer("BOT_1");
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
