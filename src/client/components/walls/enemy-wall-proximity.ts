/**
 * Enemy Wall Proximity System
 *
 * Tracks the closest enemy wall to the local player and, when within range,
 * replaces it with shard pieces that explode apart based on distance.
 *
 * Each wall is split into ~5 irregular rectangles (width × height only,
 * depth stays whole). Each rectangle becomes two depth layers (inner/outer)
 * that separate as the player approaches — the outer layer flies further.
 */

import { CollectionService, Players, RunService, Workspace } from "@rbxts/services";
import assets from "shared/assets";
import { playSound } from "shared/assetsFolder";
import { CollisionGroups } from "shared/constants/collision-groups";
import { WALL_ATTR_OWNER_ID, WALL_ATTR_TIME_ADDED, WALL_TAG } from "shared/constants/core";

// ── Configuration ───────────────────────────────────────────────────────

/**
 * Distance (studs) at which the shard explosion effect begins.
 * Increase → effect triggers from further away, more walls affected at once.
 * Decrease → player must be closer before shards appear.
 */
const EFFECT_RADIUS = 10;

/**
 * Maximum distance (studs) shards travel from their rest position at full proximity.
 * Increase → shards fly further apart, more dramatic explosion.
 * Decrease → subtler spread, shards stay closer to original wall shape.
 */
const MAX_SPREAD = 15;

/**
 * Maximum distance (studs) to scan for enemy walls each frame.
 * Increase → detects walls further away (feeds the proximity readout, not the visual effect).
 * Decrease → only walls very close to the player register as "closest".
 * Should be >= EFFECT_RADIUS; otherwise walls explode before they're detected.
 */
const MAX_DETECTION_RANGE = 15;

/**
 * Desired number of rectangular shard pieces per wall.
 * Increase → more pieces, finer fragmentation (heavier on instances).
 * Decrease → fewer, larger chunks.
 */
const TARGET_PIECES = 3;

/**
 * Minimum width or height (studs) of a shard piece before subdivision stops.
 * Increase → pieces stay larger, subdivision ends sooner.
 * Decrease → allows smaller fragments, more granular breakup.
 */
const MIN_PIECE_DIM = 2;

/**
 * Seconds between update ticks (1/30 ≈ 33 ms).
 * Increase → less frequent updates, lower CPU cost, choppier animation.
 * Decrease → smoother shard movement, higher CPU cost.
 */
const UPDATE_INTERVAL = 1 / 30;

const USER_NAME = Players.LocalPlayer.Name;

// ── Public API ──────────────────────────────────────────────────────────

let _closestDistance: number | undefined;

export function getEnemyWallProximity(): number | undefined {
	return _closestDistance;
}

// ── Geometry ────────────────────────────────────────────────────────────

function distToSegment2D(p: Vector2, a: Vector2, b: Vector2): number {
	const ab = b.sub(a);
	const lenSq = ab.Dot(ab);
	if (lenSq < 1e-6) return p.sub(a).Magnitude;
	const t = math.clamp(p.sub(a).Dot(ab) / lenSq, 0, 1);
	return p.sub(a.add(ab.mul(t))).Magnitude;
}

function wallEndpoints2D(part: BasePart): [Vector2, Vector2] {
	const hw = part.Size.X / 2;
	const cf = part.CFrame;
	const r = cf.RightVector;
	const c = cf.Position;
	return [new Vector2(c.X + r.X * hw, c.Z + r.Z * hw), new Vector2(c.X - r.X * hw, c.Z - r.Z * hw)];
}

// ── Recursive rectangle split ───────────────────────────────────────────

interface Rect {
	x: number;
	y: number;
	w: number;
	h: number;
}

function subdivideRect(fullW: number, fullH: number): Rect[] {
	const result: Rect[] = [];

	function split(r: Rect, depth: number): void {
		if (result.size() >= TARGET_PIECES || depth > 4) {
			result.push(r);
			return;
		}

		const canW = r.w > MIN_PIECE_DIM * 2;
		const canH = r.h > MIN_PIECE_DIM * 2;

		if (!canW && !canH) {
			result.push(r);
			return;
		}

		const ratio = 0.3 + math.random() * 0.4;
		const alongW = canW && (!canH || r.w >= r.h);

		// Randomly pick which half to recurse into first so the
		// largest remaining piece doesn't always land on the same side.
		const flipOrder = math.random() > 0.5;

		if (alongW) {
			const lw = r.w * ratio;
			const a: Rect = { x: r.x, y: r.y, w: lw, h: r.h };
			const b: Rect = { x: r.x + lw, y: r.y, w: r.w - lw, h: r.h };
			split(flipOrder ? b : a, depth + 1);
			split(flipOrder ? a : b, depth + 1);
		} else {
			const bh = r.h * ratio;
			const a: Rect = { x: r.x, y: r.y, w: r.w, h: bh };
			const b: Rect = { x: r.x, y: r.y + bh, w: r.w, h: r.h - bh };
			split(flipOrder ? b : a, depth + 1);
			split(flipOrder ? a : b, depth + 1);
		}
	}

	split({ x: -fullW / 2, y: -fullH / 2, w: fullW, h: fullH }, 0);
	return result;
}

// ── Shard data ──────────────────────────────────────────────────────────

/** Max random delay (seconds) before a wall's crumble sound plays. */
const SOUND_STAGGER = 0.4;

interface Shard {
	part: BasePart;
	restCFrame: CFrame;
	explodedCFrame: CFrame;
}

interface WallEffect {
	originalPart: BasePart;
	originalTransparency: number;
	shards: Shard[];
	/** Index of the largest shard — sound is parented here. */
	largestShardIdx: number;
	sound: Sound | undefined;
	soundDelay: number;
	wasMoving: boolean;
}

const enemyWalls = new Set<BasePart>();
const activeEffects = new Map<BasePart, WallEffect>();

let debrisFolder: Folder | undefined;

function getFolder(): Folder {
	if (debrisFolder && debrisFolder.Parent) return debrisFolder;
	debrisFolder = new Instance("Folder");
	debrisFolder.Name = "WallShards";
	debrisFolder.Parent = Workspace;
	return debrisFolder;
}

// ── Create / destroy effects ────────────────────────────────────────────

function hideOriginal(part: BasePart): number {
	const orig = part.Transparency;
	part.Transparency = 1;
	for (const child of part.GetDescendants()) {
		if (child.IsA("BasePart")) child.Transparency = 1;
		else if (child.IsA("Texture") || child.IsA("Decal")) child.Transparency = 1;
		else if (child.IsA("SurfaceGui")) child.Enabled = false;
		else if (child.IsA("Highlight")) child.Enabled = false;
	}
	return orig;
}

function showOriginal(part: BasePart, transparency: number): void {
	if (!part.Parent) return;
	part.Transparency = transparency;
	// Children will be restored by the server on next replication tick.
}

function makeShard(
	folder: Folder,
	w: number,
	h: number,
	depth: number,
	color: Color3,
	material: Enum.Material,
	transparency: number,
	restCF: CFrame,
	explodedCF: CFrame,
): Shard {
	const p = new Instance("Part");
	p.Name = "wall_shard";
	p.Size = new Vector3(w, h, depth);
	p.Color = color;
	p.Material = material;
	p.Transparency = transparency;
	p.Anchored = true;
	p.CanCollide = false;
	p.CastShadow = false;
	p.CollisionGroup = CollisionGroups.WALL;
	p.TopSurface = Enum.SurfaceType.Smooth;
	p.BottomSurface = Enum.SurfaceType.Smooth;
	p.CFrame = restCF;
	p.Parent = folder;

	return { part: p, restCFrame: restCF, explodedCFrame: explodedCF };
}

function awayDirection(wallCenter: Vector2, playerPos: Vector2): Vector3 {
	const toWall = wallCenter.sub(playerPos);
	const dir2D = toWall.Magnitude > 1e-3 ? toWall.Unit : new Vector2(0, 1);
	return new Vector3(dir2D.X, 0, dir2D.Y);
}

function shardExplosionOffset(
	cx: number,
	cy: number,
	halfW: number,
	halfH: number,
	wallCF: CFrame,
	away3: Vector3,
): Vector3 {
	const normX = halfW > 0 ? cx / halfW : 0;
	const normY = halfH > 0 ? cy / halfH : 0;
	const radial = wallCF.VectorToWorldSpace(new Vector3(normX, normY + 0.4, 0).Unit);
	const combined = radial.add(away3.mul(1.5)).add(new Vector3(0, 0.6, 0));
	const dir = combined.Magnitude > 1e-3 ? combined.Unit : new Vector3(0, 1, 0);
	return dir.mul(MAX_SPREAD * (0.7 + math.random() * 0.6));
}

function explodedCFrameFrom(restCF: CFrame, spread: Vector3): CFrame {
	return new CFrame(restCF.Position.add(spread)).mul(restCF.sub(restCF.Position));
}

function createEffect(wall: BasePart, playerPos: Vector2): WallEffect {
	const cf = wall.CFrame;
	const sz = wall.Size;
	const origT = hideOriginal(wall);

	const away3 = awayDirection(new Vector2(cf.Position.X, cf.Position.Z), playerPos);
	const halfW = sz.X / 2;
	const halfH = sz.Y / 2;

	const rects = subdivideRect(sz.X, sz.Y);
	const folder = getFolder();
	const shards: Shard[] = [];

	for (const r of rects) {
		const cx = r.x + r.w / 2;
		const cy = r.y + r.h / 2;
		const restCF = cf.mul(new CFrame(cx, cy, 0));
		const spread = shardExplosionOffset(cx, cy, halfW, halfH, cf, away3);
		const explodedCF = explodedCFrameFrom(restCF, spread);

		shards.push(makeShard(folder, r.w, r.h, sz.Z, wall.Color, wall.Material, origT, restCF, explodedCF));
	}

	let largestIdx = 0;
	let largestArea = 0;
	for (let i = 0; i < shards.size(); i++) {
		const s = shards[i];
		const area = s.part.Size.X * s.part.Size.Y;
		if (area > largestArea) {
			largestArea = area;
			largestIdx = i;
		}
	}

	return {
		originalPart: wall,
		originalTransparency: origT,
		shards,
		largestShardIdx: largestIdx,
		sound: undefined,
		soundDelay: 0,
		wasMoving: false,
	};
}

function destroyEffect(effect: WallEffect): void {
	showOriginal(effect.originalPart, effect.originalTransparency);
	if (effect.sound) effect.sound.Destroy();
	for (const s of effect.shards) s.part.Destroy();
}

// ── Per-frame update ────────────────────────────────────────────────────

function tryRegister(inst: Instance): void {
	if (!inst.IsA("BasePart")) return;
	const owner = inst.GetAttribute(WALL_ATTR_OWNER_ID) as string | undefined;
	if (owner === undefined || owner === USER_NAME) return;
	enemyWalls.add(inst);
}

function unregister(inst: Instance): void {
	if (!inst.IsA("BasePart")) return;
	enemyWalls.delete(inst as BasePart);
	const effect = activeEffects.get(inst as BasePart);
	if (effect) {
		destroyEffect(effect);
		activeEffects.delete(inst as BasePart);
	}
}

function isWallTooRecent(part: BasePart, now: number): boolean {
	const t = part.GetAttribute(WALL_ATTR_TIME_ADDED) as number | undefined;
	return t !== undefined && now - t < 1;
}

function scanNearbyWalls(
	playerPos: Vector2,
	now: number,
): { closest: number | undefined; nearby: Map<BasePart, number> } {
	let closest: number | undefined;
	const nearby = new Map<BasePart, number>();

	for (const part of enemyWalls) {
		if (isWallTooRecent(part, now)) continue;

		const [a, b] = wallEndpoints2D(part);
		const dist = distToSegment2D(playerPos, a, b);
		if (dist > MAX_DETECTION_RANGE) continue;
		if (closest === undefined || dist < closest) closest = dist;
		if (dist < EFFECT_RADIUS) nearby.set(part, dist);
	}

	return { closest, nearby };
}

function enforceHiddenOriginals(): void {
	for (const [part] of activeEffects) {
		if (part.Transparency !== 1) part.Transparency = 1;
	}
}

function proximityFactor(dist: number): number {
	const linear = 1 - dist / EFFECT_RADIUS;
	return linear * linear;
}

function lerpShards(shards: Shard[], factor: number): void {
	for (const s of shards) {
		s.part.CFrame = s.restCFrame.Lerp(s.explodedCFrame, factor);
	}
}

function syncEffects(nearby: Map<BasePart, number>, playerPos: Vector2): void {
	// Create effects for walls that entered range.
	for (const [part] of nearby) {
		if (!activeEffects.has(part)) {
			activeEffects.set(part, createEffect(part, playerPos));
		}
	}

	// Update or remove.
	for (const [part, effect] of activeEffects) {
		const dist = nearby.get(part);
		if (dist === undefined) {
			destroyEffect(effect);
			activeEffects.delete(part);
			continue;
		}

		const factor = proximityFactor(dist);
		lerpShards(effect.shards, factor);

		const isMoving = factor > 0.01;
		const soundParent = effect.shards[effect.largestShardIdx].part;

		// Staggered crumble sound when shards start moving.
		if (isMoving && !effect.sound) {
			if (effect.soundDelay <= 0) {
				effect.soundDelay = math.random() * SOUND_STAGGER;
			}
			effect.soundDelay -= UPDATE_INTERVAL;
			if (effect.soundDelay <= 0) {
				effect.sound = playSound(assets.sounds.bfh1_rock_falling_02, {
					parent: soundParent,
					volume: 0.3,
				});
			}
		} else if (!isMoving) {
			// Play sound when shards settle back.
			if (effect.wasMoving) {
				playSound(assets.sounds.bfh1_rock_falling_02, {
					parent: soundParent,
					volume: 0.3,
				});
			}
			if (effect.sound) {
				effect.sound.Destroy();
				effect.sound = undefined;
			}
			effect.soundDelay = 0;
		}
		effect.wasMoving = isMoving;
	}
}

function update(): void {
	const character = Players.LocalPlayer?.Character;
	if (!character) {
		_closestDistance = undefined;
		return;
	}

	const pivot = character.GetPivot();
	const playerPos = new Vector2(pivot.Position.X, pivot.Position.Z);
	const { closest, nearby } = scanNearbyWalls(playerPos, Workspace.GetServerTimeNow());

	_closestDistance = closest;
	enforceHiddenOriginals();
	syncEffects(nearby, playerPos);
}

// ── Lifecycle ───────────────────────────────────────────────────────────

let heartbeatConn: RBXScriptConnection | undefined;
let addedConn: RBXScriptConnection | undefined;
let removedConn: RBXScriptConnection | undefined;
let elapsed = 0;

export function initializeEnemyWallProximity(): void {
	for (const inst of CollectionService.GetTagged(WALL_TAG)) tryRegister(inst);
	addedConn = CollectionService.GetInstanceAddedSignal(WALL_TAG).Connect((i) => task.defer(() => tryRegister(i)));
	removedConn = CollectionService.GetInstanceRemovedSignal(WALL_TAG).Connect(unregister);
	heartbeatConn = RunService.Heartbeat.Connect((dt) => {
		elapsed += dt;
		if (elapsed < UPDATE_INTERVAL) return;
		elapsed = 0;
		update();
	});
}

export function cleanupEnemyWallProximity(): void {
	heartbeatConn?.Disconnect();
	addedConn?.Disconnect();
	removedConn?.Disconnect();
	for (const [, e] of activeEffects) destroyEffect(e);
	activeEffects.clear();
	enemyWalls.clear();
	_closestDistance = undefined;
	elapsed = 0;
}
