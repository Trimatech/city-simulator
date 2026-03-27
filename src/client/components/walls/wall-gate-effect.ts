import { CollectionService, Players, RunService, Workspace } from "@rbxts/services";
import assets from "shared/assets";
import { playSound } from "shared/assetsFolder";
import {
	WALL_ATTR_KIND,
	WALL_ATTR_OWNER_ID,
	WALL_ATTR_TARGET_Y,
	WALL_ATTR_TIME_ADDED,
	WALL_TAG,
} from "shared/constants/core";

/** How far (studs) the lifting effect reaches from the player. */
const GATE_RADIUS = 25;

/** Maximum lift (studs) applied to the closest wall segment. */
const MAX_LIFT = 15;

/** Throttle the update loop to ~30 fps. */
const UPDATE_INTERVAL = 1 / 30;

/** Skip walls that were created less than this many seconds ago (avoid fighting the spawn tween). */
const MIN_AGE_SECONDS = 1.2;

const USER_NAME = Players.LocalPlayer.Name;

// ── Per-wall bookkeeping ────────────────────────────────────────────────

/** Max random delay (seconds) before a wall's crumble sound plays. */
const SOUND_STAGGER = 0.4;

interface WallEntry {
	part: BasePart;
	targetY: number;
	sound: Sound | undefined;
	/** Remaining delay before the sound fires. Reset each time lifting begins. */
	soundDelay: number;
	/** Whether the wall was lifting last frame. */
	wasLifting: boolean;
}

/** Only walls owned by the local player. */
const ownedWalls = new Map<BasePart, WallEntry>();

// ── Geometry helpers ────────────────────────────────────────────────────

/**
 * Minimum distance from a 2-D point to a line segment.
 */
function distToSegment2D(p: Vector2, a: Vector2, b: Vector2): number {
	const ab = b.sub(a);
	const lenSq = ab.Dot(ab);
	if (lenSq < 1e-6) return p.sub(a).Magnitude;
	const t = math.clamp(p.sub(a).Dot(ab) / lenSq, 0, 1);
	return p.sub(a.add(ab.mul(t))).Magnitude;
}

/**
 * Extract the 2-D (XZ) endpoints of a wall part.
 * Walls are oriented so the X-axis of the part runs along the segment.
 */
function wallEndpoints2D(part: BasePart): [Vector2, Vector2] {
	const hw = part.Size.X / 2;
	const cf = part.CFrame;
	const r = cf.RightVector;
	const c = cf.Position;
	return [new Vector2(c.X + r.X * hw, c.Z + r.Z * hw), new Vector2(c.X - r.X * hw, c.Z - r.Z * hw)];
}

// ── Falloff ─────────────────────────────────────────────────────────────

/** Cosine falloff — 1 at center, 0 at radius, smooth in between. */
function smoothFalloff(dist: number, radius: number): number {
	if (dist >= radius) return 0;
	return (1 + math.cos((dist / radius) * math.pi)) / 2;
}

// ── Cache management ────────────────────────────────────────────────────

function tryRegister(instance: Instance): void {
	if (!instance.IsA("BasePart")) return;
	const owner = instance.GetAttribute(WALL_ATTR_OWNER_ID) as string | undefined;
	if (owner !== USER_NAME) return;
	const kind = instance.GetAttribute(WALL_ATTR_KIND) as string | undefined;
	if (kind === "tracer") return;
	const targetY = instance.GetAttribute(WALL_ATTR_TARGET_Y) as number | undefined;
	if (targetY === undefined) return;
	ownedWalls.set(instance, { part: instance, targetY, sound: undefined, soundDelay: 0, wasLifting: false });
}

function unregister(instance: Instance): void {
	if (instance.IsA("BasePart")) {
		const entry = ownedWalls.get(instance);
		if (entry?.sound) {
			entry.sound.Destroy();
		}
		ownedWalls.delete(instance);
	}
}

// ── Main update ─────────────────────────────────────────────────────────

function update(): void {
	const character = Players.LocalPlayer?.Character;
	if (!character) return;

	const pivot = character.GetPivot();
	const playerPos = new Vector2(pivot.Position.X, pivot.Position.Z);
	const now = Workspace.GetServerTimeNow();

	for (const [, entry] of ownedWalls) {
		const { part, targetY } = entry;

		// Don't touch walls still in their spawn animation.
		const timeAdded = part.GetAttribute(WALL_ATTR_TIME_ADDED) as number | undefined;
		if (timeAdded !== undefined && now - timeAdded < MIN_AGE_SECONDS) continue;

		const [a, b] = wallEndpoints2D(part);
		const dist = distToSegment2D(playerPos, a, b);
		const lift = MAX_LIFT * smoothFalloff(dist, GATE_RADIUS);

		const desiredY = targetY + lift;
		const curY = part.Position.Y;
		const isLifting = lift > 0.05;

		// Staggered crumble sound — each wall gets a random delay when lifting starts.
		if (isLifting && !entry.sound) {
			if (entry.soundDelay <= 0) {
				// First frame lifting — assign a random delay.
				entry.soundDelay = math.random() * SOUND_STAGGER;
			}
			entry.soundDelay -= UPDATE_INTERVAL;
			if (entry.soundDelay <= 0) {
				entry.sound = playSound(assets.sounds.bfh1_rock_falling_02, {
					parent: part,
					volume: 0.3,
				});
			}
		} else if (!isLifting) {
			// Play sound when wall starts coming back down.
			if (entry.wasLifting) {
				playSound(assets.sounds.bfh1_rock_falling_02, {
					parent: part,
					volume: 0.3,
				});
			}
			if (entry.sound) {
				entry.sound.Destroy();
				entry.sound = undefined;
			}
			entry.soundDelay = 0;
		}
		entry.wasLifting = isLifting;

		// Only touch CFrame when the delta is visible.
		if (math.abs(curY - desiredY) > 0.05) {
			const pos = part.Position;
			part.CFrame = new CFrame(new Vector3(pos.X, desiredY, pos.Z)).mul(
				part.CFrame.sub(pos), // preserve rotation
			);
		}
	}
}

// ── Lifecycle ───────────────────────────────────────────────────────────

let heartbeatConn: RBXScriptConnection | undefined;
let addedConn: RBXScriptConnection | undefined;
let removedConn: RBXScriptConnection | undefined;
let elapsed = 0;

export function initializeWallGateEffect(): void {
	// Populate from existing tagged parts.
	for (const inst of CollectionService.GetTagged(WALL_TAG)) {
		tryRegister(inst);
	}

	addedConn = CollectionService.GetInstanceAddedSignal(WALL_TAG).Connect((inst) => {
		// Defer so attributes are replicated.
		task.defer(() => tryRegister(inst));
	});

	removedConn = CollectionService.GetInstanceRemovedSignal(WALL_TAG).Connect(unregister);

	heartbeatConn = RunService.Heartbeat.Connect((dt) => {
		elapsed += dt;
		if (elapsed < UPDATE_INTERVAL) return;
		elapsed = 0;
		update();
	});
}

export function cleanupWallGateEffect(): void {
	heartbeatConn?.Disconnect();
	addedConn?.Disconnect();
	removedConn?.Disconnect();
	for (const [, entry] of ownedWalls) {
		if (entry.sound) entry.sound.Destroy();
	}
	ownedWalls.clear();
	elapsed = 0;
}
