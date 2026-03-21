import Object from "@rbxts/object-utils";
import { Workspace } from "@rbxts/services";
import { setTimeout } from "@rbxts/set-timeout";
import { tryGrantBadge } from "server/rewards/services/badges";
import { store } from "server/store";
import {
	ensureForceFieldOnPlayerName,
	getPlayerHumanoidByName,
	killSoldier,
	removeForceFieldFromPlayerName,
} from "server/world/world.utils";
import { Badge } from "shared/assetsFolder";
import { SOLDIER_MIN_AREA, SOLDIER_SPEED } from "shared/constants/core";
import { palette } from "shared/constants/palette";
import type { PowerupId } from "shared/constants/powerups";
import { POWERUP_DURATIONS, POWERUP_EXPLOSIONS, POWERUP_PRICES, POWERUP_TURBO_SPEED } from "shared/constants/powerups";
import {
	calculatePolygonOperation,
	pointsToVectors,
	selectLargestRegionByArea,
	vectorsToPoints,
} from "shared/polybool/poly-utils";
import { pointsToPolygon } from "shared/polybool/polybool";
import { calculatePolygonArea } from "shared/polygon-extra.utils";
import { remotes } from "shared/remotes";
import { selectSoldierById, selectSoldierOrbs, selectSoldiersById } from "shared/store/soldiers";
import { selectTowersById } from "shared/store/towers/tower-selectors";
import { placeTower } from "./placeTower";

/** Tracks the turbo generation per soldier so stacked activations extend duration correctly. */
const turboGeneration = new Map<string, number>();
/** Stores the cancel function for the active turbo timeout per soldier. */
const turboCancelMap = new Map<string, () => void>();
/** Stores the cancel function for the active shield timeout per soldier. */
const shieldCancelMap = new Map<string, () => void>();

interface Edge {
	start: Vector3;
	end: Vector3;
}

interface Face {
	points: Vector3[];
	normal: Vector3;
	direction: Vector3;
	surface: string;
}

interface Geometry {
	vertices: Vector3[];
	edges: Edge[];
	faces: Face[];
}

function convertPartToGeometry(part: BasePart): Geometry {
	const cf = part.CFrame;
	const pos = cf.Position;

	const sx = part.Size.X / 2;
	const sy = part.Size.Y / 2;
	const sz = part.Size.Z / 2;

	const xvec = cf.RightVector;
	const yvec = cf.UpVector;
	const zvec = cf.LookVector.mul(-1);

	const verts: Vector3[] = [];
	const edges: Edge[] = [];
	const faces: Face[] = [];

	const top1 = pos.add(xvec.mul(sx)).add(yvec.mul(sy)).add(zvec.mul(sz));
	const top2 = pos.add(xvec.mul(sx)).add(yvec.mul(sy)).add(zvec.mul(-sz));
	const top3 = pos.add(xvec.mul(-sx)).add(yvec.mul(sy)).add(zvec.mul(-sz));
	const top4 = pos.add(xvec.mul(-sx)).add(yvec.mul(sy)).add(zvec.mul(sz));
	//
	const bottom5 = pos.add(xvec.mul(sx)).add(yvec.mul(-sy)).add(zvec.mul(sz));
	const bottom6 = pos.add(xvec.mul(sx)).add(yvec.mul(-sy)).add(zvec.mul(-sz));
	const bottom7 = pos.add(xvec.mul(-sx)).add(yvec.mul(-sy)).add(zvec.mul(-sz));
	const bottom8 = pos.add(xvec.mul(-sx)).add(yvec.mul(-sy)).add(zvec.mul(sz));

	verts.push(top1, top2, top3, top4, bottom5, bottom6, bottom7, bottom8);

	faces.push(
		{
			points: [top1, top2, bottom6, bottom5],
			normal: xvec.mul(-1),
			direction: yvec,
			surface: "RightSurface",
		},
		{
			points: [top4, top3, bottom7, bottom8],
			normal: xvec,
			direction: yvec,
			surface: "LeftSurface",
		},
		{
			points: [top1, top2, top3, top4],
			normal: yvec.mul(-1),
			direction: zvec,
			surface: "TopSurface",
		},
		{
			points: [bottom5, bottom6, bottom7, bottom8],
			normal: yvec,
			direction: zvec,
			surface: "BottomSurface",
		},
		{
			points: [top2, top3, bottom7, bottom6],
			normal: zvec,
			direction: yvec,
			surface: "BackSurface",
		},
		{
			points: [top1, top4, bottom8, bottom5],
			normal: zvec.mul(-1),
			direction: yvec,
			surface: "FrontSurface",
		},
	);

	return {
		vertices: verts,
		edges,
		faces,
	};
}

function getPart2DFootprint(part: BasePart): Vector2[] {
	const geometry = convertPartToGeometry(part);

	// Find the bottom face (Y-normal pointing up)
	const bottomFace = geometry.faces.find((face) => face.surface === "BottomSurface");
	if (!bottomFace) {
		warn("Could not find bottom face for part footprint");
		return [];
	}

	// Convert 3D points to 2D (X, Z coordinates)
	return bottomFace.points.map((point) => new Vector2(point.X, point.Z));
}

function trySpendOrbs(playerName: string, cost: number) {
	const orbs = store.getState(selectSoldierOrbs(playerName)) ?? 0;
	if (orbs < cost) return false;
	store.decrementSoldierOrbs(playerName, cost);
	return true;
}

function alertMessage(player: Player, message: string, color = palette.blue) {
	remotes.client.alert.fire(player, {
		scope: "money",
		emoji: "🔮",
		message,
		color,
	});
}

function magnitude2D(a: Vector2, b: Vector2) {
	return a.sub(b).Magnitude;
}

function pushHumanoidAway(h: Humanoid, from3D: Vector3, strength: number) {
	const root = h.RootPart as BasePart | undefined;
	if (!root) return;
	const dir = root.Position.sub(from3D);
	const planar = new Vector3(dir.X, 0, dir.Z);
	const unit = planar.Magnitude > 0 ? planar.Unit : new Vector3();
	root.AssemblyLinearVelocity = unit.mul(strength);
}

function isPointInRectangleWithCFrame(point: Vector2, cframe: CFrame, size: Vector3) {
	// Convert 2D point to 3D point
	const point3D = new Vector3(point.X, 0, point.Y);

	// Transform point to local space of the rectangle
	const localPoint = cframe.Inverse().mul(point3D);

	// Check if point is within rectangle bounds (length along X, width along Z)
	return math.abs(localPoint.X) <= size.X / 2 && math.abs(localPoint.Z) <= size.Z / 2;
}

function createExplosionPart(center: Vector2, length: number, width: number, cframe2: CFrame): Part {
	// cframe2 is expected to be an absolute CFrame positioned at the desired center
	const explosion = new Instance("Part");
	explosion.Name = "ExplosionPart";
	// Map width to X (RightVector), length to Z (LookVector)
	explosion.Size = new Vector3(width, 1, length);
	explosion.CFrame = cframe2;
	explosion.Anchored = true;
	explosion.CanCollide = false;
	explosion.CastShadow = false;
	explosion.Parent = Workspace;
	return explosion;
}

function interpolateRectangleEdges(corners: Vector2[], segmentsPerEdge = 8): Vector2[] {
	const interpolatedPoints: Vector2[] = [];

	for (let i = 0; i < corners.size(); i++) {
		const current = corners[i];
		const nextCorner = corners[(i + 1) % corners.size()];

		// Add the current corner
		interpolatedPoints.push(current);

		// Interpolate along the edge
		for (let j = 1; j < segmentsPerEdge; j++) {
			const t = j / segmentsPerEdge;
			const interpolatedX = current.X + (nextCorner.X - current.X) * t;
			const interpolatedY = current.Y + (nextCorner.Y - current.Y) * t;
			interpolatedPoints.push(new Vector2(interpolatedX, interpolatedY));
		}
	}

	return interpolatedPoints;
}

function createExplosionPolygonFromPart(center: Vector2, length: number, width: number, cframe: CFrame): Vector2[] {
	// For rectangular explosions, we can use the direct geometry approach
	// and then interpolate along the edges for smoother polygons
	const tempPart = createExplosionPart(center, length, width, cframe);
	const footprint = getPart2DFootprint(tempPart);

	// Clean up the temporary part
	tempPart.Destroy();

	// Interpolate along the edges for a smoother polygon
	const interpolatedFootprint = interpolateRectangleEdges(footprint, 4); // 4 segments per edge

	print(`[DEBUG] createExplosionPolygonFromPart: created ${interpolatedFootprint.size()} interpolated points`);
	print(`[DEBUG] Explosion polygon points: ${interpolatedFootprint.map((p) => `(${p.X}, ${p.Y})`).join(", ")}`);

	return interpolatedFootprint;
}

function createCircularExplosionPolygonFromPart(center: Vector2, radius: number): Vector2[] {
	// For circular explosions, we need to create an interpolated circle
	// since the geometry approach only gives us the bounding box corners
	const segments = 32; // More segments for smoother circle
	const points: Vector2[] = [];
	const angleStep = (2 * math.pi) / segments;

	for (let i = 0; i < segments; i++) {
		const angle = i * angleStep;
		const x = center.X + radius * math.cos(angle);
		const y = center.Y + radius * math.sin(angle);
		points.push(new Vector2(x, y));
	}

	print(`[DEBUG] createCircularExplosionPolygonFromPart: created ${points.size()} interpolated points`);
	print(`[DEBUG] Circular explosion polygon points: ${points.map((p) => `(${p.X}, ${p.Y})`).join(", ")}`);

	return points;
}

function cutDamageAreaFromSoldiers(damagePolygon: Vector2[]) {
	const soldiers = store.getState(selectSoldiersById);
	const damagePolygonObj = pointsToPolygon(vectorsToPoints(damagePolygon));

	print(`[DEBUG] cutDamageAreaFromSoldiers: damagePolygon has ${damagePolygon.size()} points`);
	print(`[DEBUG] cutDamageAreaFromSoldiers: damagePolygonObj has ${damagePolygonObj.regions.size()} regions`);
	print(`[DEBUG] cutDamageAreaFromSoldiers: processing ${Object.keys(soldiers).size()} soldiers`);

	// Debug the damage polygon
	print(`[DEBUG] Damage polygon points: ${damagePolygon.map((p) => `(${p.X}, ${p.Y})`).join(", ")}`);

	for (const [soldierId, soldier] of Object.entries(soldiers)) {
		if (!soldier || soldier.dead) continue;

		print(`[DEBUG] Processing soldier ${soldierId} with polygon of ${soldier.polygon.size()} points`);
		print(
			`[DEBUG] Soldier ${soldierId} polygon points: ${soldier.polygon.map((p) => `(${p.X}, ${p.Y})`).join(", ")}`,
		);

		const soldierPolygon = pointsToPolygon(vectorsToPoints(soldier.polygon));

		// First check if there's any intersection
		let intersectionResult;
		try {
			intersectionResult = calculatePolygonOperation(soldierPolygon, damagePolygonObj, "Intersect");
		} catch (err) {
			warn(`[DEBUG] Intersection failed for ${soldierId}`, err);
			continue;
		}
		print(`[DEBUG] Intersection result for ${soldierId}: ${intersectionResult.regions.size()} regions`);
		if (intersectionResult.regions.size() > 0) {
			print(`[DEBUG] Intersection found, proceeding with difference operation`);
			let differenceResult;
			try {
				differenceResult = calculatePolygonOperation(soldierPolygon, damagePolygonObj, "Difference");
			} catch (err) {
				warn(`[DEBUG] Difference failed for ${soldierId}`, err);
				continue;
			}

			print(`[DEBUG] Difference result for ${soldierId}: ${differenceResult.regions.size()} regions`);
			if (differenceResult.regions.size() > 0) {
				print(`[DEBUG] Regions returned: ${differenceResult.regions.size()}`);
			}

			if (differenceResult.regions.size() > 0) {
				const bestRegion = selectLargestRegionByArea(differenceResult.regions);

				if (bestRegion !== undefined) {
					const updatedPolygon = pointsToVectors(bestRegion);
					const updatedArea = calculatePolygonArea(updatedPolygon);

					print(
						`[DEBUG] Updating soldier ${soldierId} polygon: old area ${soldier.polygonAreaSize}, new area ${updatedArea}`,
					);

					store.setSoldierPolygon(soldierId as string, updatedPolygon, updatedArea);
					store.setSoldierPolygonAreaSize(soldierId as string, updatedArea);

					// Kill soldier if area becomes too small
					if (updatedArea < SOLDIER_MIN_AREA) {
						print(`[DEBUG] Soldier ${soldierId} area too small, killing`);
						killSoldier(soldierId as string);
						store.playerKilledSoldier("system", soldierId as string);
					}
				} else {
					print(
						`[DEBUG] No valid difference region for soldier ${soldierId} - fully covered, killing and clearing area`,
					);
					store.setSoldierPolygon(soldierId as string, [], 0, true);
					store.setSoldierPolygonAreaSize(soldierId as string, 0);
					killSoldier(soldierId as string);
					store.playerKilledSoldier("system", soldierId as string);
				}
			} else {
				print(
					`[DEBUG] No valid difference result for soldier ${soldierId} - fully covered, killing and clearing area`,
				);
				// Fully covered by damage area: clear polygon immediately, then kill
				store.setSoldierPolygon(soldierId as string, [], 0, true);
				store.setSoldierPolygonAreaSize(soldierId as string, 0);
				killSoldier(soldierId as string);
				store.playerKilledSoldier("system", soldierId as string);
			}
		} else {
			print(`[DEBUG] No intersection found for soldier ${soldierId}, skipping difference operation`);
		}
	}
}

const POWERUP_ALERT_MESSAGES: Record<PowerupId, string> = {
	turbo: "Turbo activated!",
	shield: "Shield activated!",
	tower: "Tower placed!",
	laserBeam: "Laser Beam deployed!",
	nuclearExplosion: "Nuclear Explosion detonated!",
};

export function executePowerupForSoldier(
	soldierId: string,
	powerupId: PowerupId,
	options?: { skipCost?: boolean; directionToward?: Vector2; player?: Player },
) {
	const soldier = store.getState(selectSoldierById(soldierId));
	if (!soldier || soldier.dead) return;

	const skipCost = options?.skipCost ?? false;
	const directionToward = options?.directionToward ?? new Vector2(1, 0);
	const player = options?.player;

	if (!skipCost) {
		const cost = POWERUP_PRICES[powerupId];
		if (!trySpendOrbs(soldierId, cost)) {
			if (player) alertMessage(player, "Not enough orbs!", palette.red);
			return;
		}
		// Track orbs spent and powerup usage for badges
		store.addMilestoneOrbsSpent(soldierId, cost);
	}
	store.addMilestonePowerupUsed(soldierId, powerupId);

	const center = soldier.position;

	switch (powerupId) {
		case "turbo": {
			const gen = (turboGeneration.get(soldierId) ?? 0) + 1;
			turboGeneration.set(soldierId, gen);

			const now = Workspace.GetServerTimeNow();
			const activeUntil =
				math.max(store.getState(selectSoldierById(soldierId))?.turboActiveUntil ?? 0, now) +
				POWERUP_DURATIONS.turbo;
			store.setSoldierTurboActiveUntil(soldierId, activeUntil);

			const humanoid = getPlayerHumanoidByName(soldierId);
			if (humanoid) {
				humanoid.WalkSpeed = POWERUP_TURBO_SPEED;
				const prevCancel = turboCancelMap.get(soldierId);
				if (prevCancel) prevCancel();
				const cancel = setTimeout(() => {
					if (turboGeneration.get(soldierId) !== gen) return;
					turboGeneration.delete(soldierId);
					turboCancelMap.delete(soldierId);
					store.setSoldierTurboActiveUntil(soldierId, 0);
					const again = getPlayerHumanoidByName(soldierId);
					if (again) again.WalkSpeed = SOLDIER_SPEED;
				}, activeUntil - now);
				turboCancelMap.set(soldierId, cancel);
			}
			break;
		}
		case "shield": {
			const now = Workspace.GetServerTimeNow();
			const activeUntil =
				math.max(store.getState(selectSoldierById(soldierId))?.shieldActiveUntil ?? 0, now) +
				POWERUP_DURATIONS.shield;
			store.setSoldierShieldActiveUntil(soldierId, activeUntil);
			ensureForceFieldOnPlayerName(soldierId, true);
			const prevCancel = shieldCancelMap.get(soldierId);
			if (prevCancel) prevCancel();
			const cancel = setTimeout(() => {
				shieldCancelMap.delete(soldierId);
				store.setSoldierShieldActiveUntil(soldierId, 0);
				removeForceFieldFromPlayerName(soldierId);
			}, activeUntil - now);
			shieldCancelMap.set(soldierId, cancel);
			break;
		}
		case "tower": {
			if (!player) {
				warn(`Cannot place tower: no player provided for ${soldierId}`);
				break;
			}
			const dir = directionToward.Magnitude > 0.001 ? directionToward.Unit : new Vector2(0, 1);
			const towerPos = center.add(dir.mul(10));
			placeTower(player, { skipCost: true, position: towerPos });
			break;
		}
		case "laserBeam": {
			const cfg = POWERUP_EXPLOSIONS.laserBeam;
			const dirUnit = directionToward.Magnitude > 0.001 ? directionToward.Unit : new Vector2(0, 1);
			const bombCenter2D = center.add(dirUnit.mul(cfg.length / 2));
			const forwardUnit = new Vector3(dirUnit.X, 0, dirUnit.Y);
			const cframe = CFrame.lookAt(
				new Vector3(bombCenter2D.X, 0.5, bombCenter2D.Y),
				new Vector3(bombCenter2D.X, 0.5, bombCenter2D.Y).add(forwardUnit),
			);
			const size = new Vector3(cfg.width, 5, cfg.length);

			let laserHitEnemy = false;
			const soldiers = store.getState(selectSoldiersById);
			for (const [, s] of Object.entries(soldiers)) {
				if (!s || s.dead || s.id === soldierId) continue;
				if (isPointInRectangleWithCFrame(s.position, cframe, size)) {
					laserHitEnemy = true;
					const h = getPlayerHumanoidByName(s.id);
					if (h) {
						pushHumanoidAway(h, new Vector3(bombCenter2D.X, 0, bombCenter2D.Y), 80);
					}
					const h2 = getPlayerHumanoidByName(s.id);
					if (h2) h2.TakeDamage(cfg.damage);
					store.setMilestoneLastDamageAt(s.id, Workspace.GetServerTimeNow());
				}
			}
			if (laserHitEnemy) {
				tryGrantBadge(soldierId, Badge.LASER_PRECISION);
			}

			const towers = store.getState(selectTowersById);
			for (const [id, t] of Object.entries(towers)) {
				if (!t || t.ownerId === soldierId) continue;
				if (isPointInRectangleWithCFrame(t.position, cframe, size)) {
					store.removeTower(`${id}`);
					store.setMilestoneTowerDestroyed(soldierId);
				}
			}

			const damagePolygon = createExplosionPolygonFromPart(bombCenter2D, cfg.length, cfg.width, cframe);
			cutDamageAreaFromSoldiers(damagePolygon);
			remotes.client.powerupCarpet.fireAll(cframe, size);
			break;
		}
		case "nuclearExplosion": {
			const cfg = POWERUP_EXPLOSIONS.nuclearExplosion;
			const soldiers = store.getState(selectSoldiersById);
			for (const [, s] of Object.entries(soldiers)) {
				if (!s || s.dead || s.id === soldierId) continue;
				if (magnitude2D(s.position, center) <= cfg.radius) {
					killSoldier(s.id);
				}
			}
			const towers = store.getState(selectTowersById);
			for (const [id, t] of Object.entries(towers)) {
				if (!t || t.ownerId === soldierId) continue;
				if (magnitude2D(t.position, center) <= cfg.radius) {
					store.removeTower(`${id}`);
					store.setMilestoneTowerDestroyed(soldierId);
				}
			}
			const damagePolygon = createCircularExplosionPolygonFromPart(center, cfg.radius);
			cutDamageAreaFromSoldiers(damagePolygon);
			const nuclearCFrame = new CFrame(center.X, 0.5, center.Y);
			const size = new Vector3(5, cfg.radius * 2, cfg.radius * 2);
			remotes.client.powerupNuclear.fireAll(nuclearCFrame, size);
			break;
		}
		default:
			warn(`Unknown powerup id ${powerupId}`);
	}

	// placeTower handles its own alerts (including failure cases)
	if (player && powerupId !== "tower") alertMessage(player, POWERUP_ALERT_MESSAGES[powerupId], palette.green);
}

function getPlayerLookDirection(player: Player): Vector2 | undefined {
	const character = player.Character as Model | undefined;
	if (!character) return undefined;
	const primaryPart =
		(character.PrimaryPart as BasePart | undefined) ??
		(character.FindFirstChild("HumanoidRootPart") as BasePart | undefined);
	if (!primaryPart) return undefined;
	const look = primaryPart.CFrame.LookVector;
	return new Vector2(look.X, look.Z);
}

export async function initPowerupService() {
	remotes.powerups.use.connect((player, id) => {
		const directionToward = getPlayerLookDirection(player);
		executePowerupForSoldier(player.Name, id as PowerupId, {
			player,
			directionToward,
		});
	});
}
