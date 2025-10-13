import Object from "@rbxts/object-utils";
import { Workspace } from "@rbxts/services";
import { setTimeout } from "@rbxts/set-timeout";
import { store } from "server/store";
import {
	ensureForceFieldOnPlayerName,
	getPlayerHumanoidByName,
	killSoldier,
	removeForceFieldFromPlayerName,
} from "server/world/world.utils";
import { sounds } from "shared/assets";
import { SOLDIER_MIN_AREA, SOLDIER_SPEED } from "shared/constants/core";
import { palette } from "shared/constants/palette";
import {
	POWERUP_DURATIONS,
	POWERUP_EXPLOSIONS,
	POWERUP_PRICES,
	POWERUP_TURBO_SPEEDS,
	PowerupId,
} from "shared/constants/powerups";
import { calculatePolygonOperation, pointsToVectors, vectorsToPoints } from "shared/polybool/poly-utils";
import { Point, pointsToPolygon } from "shared/polybool/polybool";
import { calculatePolygonArea } from "shared/polygon-extra.utils";
import { remotes } from "shared/remotes";
import { selectSoldierById, selectSoldierOrbs, selectSoldiersById } from "shared/store/soldiers";
import { selectTowersById } from "shared/store/towers/tower-selectors";
import { findCharacterPrimaryPart } from "shared/utils/player-utils";

import { placeTower } from "../soldiers/soldiers.placeTower";

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

function alert(player: Player, message: string, color = palette.blue) {
	remotes.client.alert.fire(player, {
		scope: "money",
		emoji: "🔮",
		message,
		color,
		sound: sounds.alert_money,
	});
}

function triggerTurbo(player: Player, id: PowerupId) {
	const playerName = player.Name;
	const speed = id === "turbo2x" ? POWERUP_TURBO_SPEEDS.turbo2x : POWERUP_TURBO_SPEEDS.turbo;
	const duration = id === "turbo2x" ? POWERUP_DURATIONS.turbo2x : POWERUP_DURATIONS.turbo;
	if (!trySpendOrbs(playerName, POWERUP_PRICES[id])) {
		alert(player, "Not enough orbs!", palette.red);
		return;
	}
	const humanoid = getPlayerHumanoidByName(playerName);
	if (humanoid) {
		humanoid.WalkSpeed = speed;
		setTimeout(() => {
			const again = getPlayerHumanoidByName(playerName);
			if (again) again.WalkSpeed = SOLDIER_SPEED;
		}, duration);
	}
	alert(player, id === "turbo2x" ? "Turbo 2x activated!" : "Turbo activated!", palette.green);
}

function triggerShield(player: Player) {
	const playerName = player.Name;
	if (!trySpendOrbs(playerName, POWERUP_PRICES.shield)) {
		alert(player, "Not enough orbs!", palette.red);
		return;
	}
	// enable shield in state
	store.setSoldierShieldActive(playerName, true);

	// create a ForceField on the character for the duration
	ensureForceFieldOnPlayerName(playerName, true);

	setTimeout(() => {
		// disable shield in state and remove forcefield if present
		store.setSoldierShieldActive(playerName, false);
		removeForceFieldFromPlayerName(playerName);
	}, POWERUP_DURATIONS.shield);

	alert(player, "Shield activated!", palette.green);
}

function triggeBruildTower(player: Player) {
	// Reuse existing purchase/price logic in soldiers.placeTower – do not double charge
	const soldier = store.getState(selectSoldierById(player.Name));
	if (!soldier) return;
	placeTower(player, soldier.position);
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
		const intersectionResult = calculatePolygonOperation(soldierPolygon, damagePolygonObj, "Intersect");
		print(`[DEBUG] Intersection result for ${soldierId}: ${intersectionResult.regions.size()} regions`);
		if (intersectionResult.regions.size() > 0) {
			print(`[DEBUG] Intersection found, proceeding with difference operation`);
			const differenceResult = calculatePolygonOperation(soldierPolygon, damagePolygonObj, "Difference");

			print(`[DEBUG] Difference result for ${soldierId}: ${differenceResult.regions.size()} regions`);
			if (differenceResult.regions.size() > 0) {
				print(`[DEBUG] First region has ${differenceResult.regions[0].size()} points`);
			}

			if (differenceResult.regions.size() > 0 && differenceResult.regions[0].size() > 2) {
				const updatedPolygon = pointsToVectors(differenceResult.regions[0] as Point[]);
				const updatedArea = calculatePolygonArea(updatedPolygon);

				print(
					`[DEBUG] Updating soldier ${soldierId} polygon: old area ${soldier.polygonAreaSize}, new area ${updatedArea}`,
				);

				store.setSoldierPolygon(soldierId as string, updatedPolygon, updatedArea);

				// Kill soldier if area becomes too small
				if (updatedArea < SOLDIER_MIN_AREA) {
					print(`[DEBUG] Soldier ${soldierId} area too small, killing`);
					killSoldier(soldierId as string);
					store.playerKilledSoldier("system", soldierId as string);
				}
			} else {
				print(`[DEBUG] No valid difference result for soldier ${soldierId}`);
			}
		} else {
			print(`[DEBUG] No intersection found for soldier ${soldierId}, skipping difference operation`);
		}
	}
}

function triggerLaserBeam(player: Player) {
	const playerName = player.Name;
	const cfg = POWERUP_EXPLOSIONS.laserBeam;
	const cost = POWERUP_PRICES.laserBeam;
	if (!trySpendOrbs(playerName, cost)) {
		alert(player, "Not enough orbs!", palette.red);
		return;
	}

	const centerSoldier = store.getState(selectSoldierById(playerName));
	if (!centerSoldier) {
		warn(`triggerLaserBeam: centerSoldier not found for player ${playerName}`);
		return;
	}

	// Get player's character to determine facing direction
	const character = player.Character as Model;
	const primaryPart = findCharacterPrimaryPart(character);

	if (!primaryPart) {
		warn(`triggerLaserBeam: primaryPart not found for player ${playerName}`);
		return;
	}

	// Calculate the center of the carpet bomb area (in front of player)
	const lookVector = primaryPart.CFrame.LookVector;
	const forwardOffset = lookVector.mul(cfg.length / 2);
	const bombCenter = primaryPart.Position.add(forwardOffset);
	const bombCenter2D = new Vector2(bombCenter.X, bombCenter.Z);

	// Calculate angle for the rectangle (player's facing direction)
	// The rectangle's length should align with player's forward direction

	print(`[DEBUG] Player lookVector: ${lookVector},`);

	// Build an absolute CFrame at the bomb center, oriented along player's forward
	const forwardFlat = new Vector3(lookVector.X, 0, lookVector.Z);
	const forwardUnit = forwardFlat.Magnitude > 0 ? forwardFlat.Unit : new Vector3(0, 0, 1);
	const cframe = CFrame.lookAt(
		new Vector3(bombCenter2D.X, 0.5, bombCenter2D.Y),
		new Vector3(bombCenter2D.X, 0.5, bombCenter2D.Y).add(forwardUnit),
	);
	// For hit detection, X corresponds to width (RightVector), Z corresponds to length (LookVector)
	const size = new Vector3(cfg.width, 5, cfg.length);

	// Affect enemy soldiers in the rectangular area
	const soldiers = store.getState(selectSoldiersById);
	for (const [, s] of Object.entries(soldiers)) {
		if (!s || s.dead || s.id === playerName) continue;
		if (isPointInRectangleWithCFrame(s.position, cframe, size)) {
			// Push and damage
			const h = getPlayerHumanoidByName(s.id);
			if (h) {
				pushHumanoidAway(h, new Vector3(bombCenter2D.X, 0, bombCenter2D.Y), 80);
			}

			const h2 = getPlayerHumanoidByName(s.id);
			if (h2) {
				h2.TakeDamage(cfg.damage);
			}
		}
	}

	// Affect enemy towers in the rectangular area
	const towers = store.getState(selectTowersById);
	for (const [id, t] of Object.entries(towers)) {
		if (!t || t.ownerId === playerName) continue;
		if (isPointInRectangleWithCFrame(t.position, cframe, size)) {
			const towerId = `${id}`;
			store.removeTower(towerId);
		}
	}

	// Cut damage area from all soldier polygons (including the player who fired it)
	// Try the new geometry-based approach first
	const damagePolygon = createExplosionPolygonFromPart(bombCenter2D, cfg.length, cfg.width, cframe);
	print(
		`[DEBUG] LaserBeam damage polygon (geometry-based): center=${bombCenter2D}, length=${cfg.length}, width=${cfg.width}`,
	);
	print(`[DEBUG] LaserBeam damage polygon points: ${damagePolygon.map((p) => `(${p.X}, ${p.Y})`).join(", ")}`);
	cutDamageAreaFromSoldiers(damagePolygon);

	// Send visual effect to all clients
	print(`[DEBUG] Created CFrame: ${cframe}, LookVector: ${cframe.LookVector}, RightVector: ${cframe.RightVector}`);

	remotes.client.powerupCarpet.fireAll(cframe, size);

	alert(player, "Laser Beam deployed!", palette.green);
}

function triggerNuclearExplosion(player: Player) {
	const playerName = player.Name;
	const cfg = POWERUP_EXPLOSIONS.nuclearExplosion;
	const cost = POWERUP_PRICES.nuclearExplosion;
	if (!trySpendOrbs(playerName, cost)) {
		alert(player, "Not enough orbs!", palette.red);
		return;
	}
	const centerSoldier = store.getState(selectSoldierById(playerName));
	if (!centerSoldier) return;
	const center = centerSoldier.position;

	// Affect enemy soldiers - mega explosion kills everything
	const soldiers = store.getState(selectSoldiersById);
	for (const [, s] of Object.entries(soldiers)) {
		if (!s || s.dead || s.id === playerName) continue;
		if (magnitude2D(s.position, center) <= cfg.radius) {
			killSoldier(s.id);
		}
	}

	// Affect enemy towers (remove within radius)
	const towers = store.getState(selectTowersById);
	for (const [id, t] of Object.entries(towers)) {
		if (!t || t.ownerId === playerName) continue;
		if (magnitude2D(t.position, center) <= cfg.radius) {
			const towerId = `${id}`;
			store.removeTower(towerId);
		}
	}

	const damagePolygon = createCircularExplosionPolygonFromPart(center, cfg.radius);
	print(`[DEBUG] Nuclear damage polygon (geometry-based): center=${center}, radius=${cfg.radius}`);

	cutDamageAreaFromSoldiers(damagePolygon);

	const nuclearCFrame = new CFrame(center.X, 0.5, center.Y);
	const size = new Vector3(5, cfg.radius * 2, cfg.radius * 2);
	remotes.client.powerupNuclear.fireAll(nuclearCFrame, size);

	alert(player, "Nuclear Explosion detonated!", palette.green);
}

export async function initPowerupService() {
	remotes.powerups.use.connect((player, id) => {
		const soldier = store.getState(selectSoldierById(player.Name));
		if (!soldier || soldier.dead) return;
		switch (id as PowerupId) {
			case "turbo":
				triggerTurbo(player, "turbo");
				break;
			case "turbo2x":
				triggerTurbo(player, "turbo2x");
				break;
			case "shield":
				triggerShield(player);
				break;
			case "tower":
				triggeBruildTower(player);
				break;
			case "laserBeam":
				triggerLaserBeam(player);
				break;
			case "nuclearExplosion":
				triggerNuclearExplosion(player);
				break;
			default:
				warn(`Unknown powerup id ${id}`);
		}
	});
}
