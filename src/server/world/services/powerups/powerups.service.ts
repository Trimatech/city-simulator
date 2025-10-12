import Object from "@rbxts/object-utils";
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

// shield state is now tracked in Reflex store per soldier

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

function isPointInRectangleWithCFrame(point: Vector2, cframe: CFrame, size: Vector2) {
	// Convert 2D point to 3D point
	const point3D = new Vector3(point.X, 0, point.Y);

	// Transform point to local space of the rectangle
	const localPoint = cframe.Inverse().mul(point3D);

	// Check if point is within rectangle bounds (length along X, width along Z)
	return math.abs(localPoint.X) <= size.X / 2 && math.abs(localPoint.Z) <= size.Y / 2;
}

function createRectanglePolygon(center: Vector2, length: number, width: number, angle: number): Vector2[] {
	const halfLength = length / 2;
	const halfWidth = width / 2;

	// Create rectangle corners in local space
	const corners = [
		new Vector2(-halfLength, -halfWidth),
		new Vector2(halfLength, -halfWidth),
		new Vector2(halfLength, halfWidth),
		new Vector2(-halfLength, halfWidth),
	];

	// Rotate and translate corners
	const cos = math.cos(angle);
	const sin = math.sin(angle);

	return corners.map((corner) => {
		const rotatedX = corner.X * cos - corner.Y * sin;
		const rotatedY = corner.X * sin + corner.Y * cos;
		return new Vector2(rotatedX + center.X, rotatedY + center.Y);
	});
}

function createCirclePolygon(center: Vector2, radius: number, segments = 16): Vector2[] {
	const points: Vector2[] = [];
	const angleStep = (2 * math.pi) / segments;

	for (let i = 0; i < segments; i++) {
		const angle = i * angleStep;
		const x = center.X + radius * math.cos(angle);
		const y = center.Y + radius * math.sin(angle);
		points.push(new Vector2(x, y));
	}

	return points;
}

function cutDamageAreaFromSoldiers(damagePolygon: Vector2[], excludePlayerName?: string) {
	const soldiers = store.getState(selectSoldiersById);
	const damagePolygonObj = pointsToPolygon(vectorsToPoints(damagePolygon));

	print(`[DEBUG] cutDamageAreaFromSoldiers: damagePolygon has ${damagePolygon.size()} points`);
	print(`[DEBUG] cutDamageAreaFromSoldiers: damagePolygonObj has ${damagePolygonObj.regions.size()} regions`);
	print(`[DEBUG] cutDamageAreaFromSoldiers: processing ${Object.keys(soldiers).size()} soldiers`);

	for (const [soldierId, soldier] of Object.entries(soldiers)) {
		if (!soldier || soldier.dead || soldierId === excludePlayerName) continue;

		print(`[DEBUG] Processing soldier ${soldierId} with polygon of ${soldier.polygon.size()} points`);

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
					store.playerKilledSoldier(excludePlayerName ?? "system", soldierId as string);
					if (excludePlayerName !== undefined && excludePlayerName !== "") {
						store.incrementSoldierEliminations(excludePlayerName);
					}
				}
			} else {
				print(`[DEBUG] No valid difference result for soldier ${soldierId}`);
			}
		} else {
			print(`[DEBUG] No intersection found for soldier ${soldierId}, skipping difference operation`);
		}
	}
}

function triggerCarpetBomb(player: Player) {
	const playerName = player.Name;
	const cfg = POWERUP_EXPLOSIONS.carpetBomb;
	const cost = POWERUP_PRICES.carpetBomb;
	if (!trySpendOrbs(playerName, cost)) {
		alert(player, "Not enough orbs!", palette.red);
		return;
	}

	const centerSoldier = store.getState(selectSoldierById(playerName));
	if (!centerSoldier) {
		warn(`triggerCarpetBomb: centerSoldier not found for player ${playerName}`);
		return;
	}

	// Get player's character to determine facing direction
	const character = player.Character as Model;
	const primaryPart = findCharacterPrimaryPart(character);

	if (!primaryPart) {
		warn(`triggerCarpetBomb: primaryPart not found for player ${playerName}`);
		return;
	}

	// Calculate the center of the carpet bomb area (in front of player)
	const lookVector = primaryPart.CFrame.LookVector;
	const forwardOffset = lookVector.mul(cfg.length / 2);
	const bombCenter = primaryPart.Position.add(forwardOffset);
	const bombCenter2D = new Vector2(bombCenter.X, bombCenter.Z);

	// Calculate angle for the rectangle (player's facing direction)
	// The rectangle's length should align with player's forward direction
	const angle = math.atan2(lookVector.Z, lookVector.X);
	print(`[DEBUG] Player lookVector: ${lookVector}, angle: ${angle} (${math.deg(angle)} degrees)`);

	// Create CFrame and size for consistent rectangle checking
	const cframe = new CFrame(bombCenter2D.X, 0, bombCenter2D.Y).mul(CFrame.Angles(0, angle - math.pi / 2, 0));
	const size = new Vector2(cfg.length, cfg.width);

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
	const damagePolygon = createRectanglePolygon(bombCenter2D, cfg.length, cfg.width, angle);
	print(
		`[DEBUG] Carpet bomb damage polygon: center=${bombCenter2D}, length=${cfg.length}, width=${cfg.width}, angle=${angle}`,
	);
	print(`[DEBUG] Carpet bomb damage polygon points: ${damagePolygon.map((p) => `(${p.X}, ${p.Y})`).join(", ")}`);
	cutDamageAreaFromSoldiers(damagePolygon, playerName);

	// Send visual effect to all clients
	print(`[DEBUG] Created CFrame: ${cframe}, LookVector: ${cframe.LookVector}, RightVector: ${cframe.RightVector}`);

	remotes.client.powerupExplosion.fireAll({
		explosionType: "carpetBomb",
		center: bombCenter2D,
		cframe: cframe,
		size: size,
	});

	alert(player, "Carpet Bomb deployed!", palette.green);
}

function triggerMegaExplosion(player: Player) {
	const playerName = player.Name;
	const cfg = POWERUP_EXPLOSIONS.megaExplosion;
	const cost = POWERUP_PRICES.megaExplosion;
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

	// Cut damage area from all soldier polygons (including the player who fired it)
	const damagePolygon = createCirclePolygon(center, cfg.radius);
	print(`[DEBUG] Nuclear damage polygon: center=${center}, radius=${cfg.radius}`);
	print(`[DEBUG] Nuclear damage polygon points: ${damagePolygon.map((p) => `(${p.X}, ${p.Y})`).join(", ")}`);
	cutDamageAreaFromSoldiers(damagePolygon, playerName);

	// Send visual effect to all clients
	remotes.client.powerupExplosion.fireAll({
		explosionType: "nuclear",
		center: center,
		radius: cfg.radius,
	});

	alert(player, "Nuclear Bomb detonated!", palette.green);
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
			case "carpetBomb":
				triggerCarpetBomb(player);
				break;
			case "megaExplosion":
				triggerMegaExplosion(player);
				break;
			default:
				warn(`Unknown powerup id ${id}`);
		}
	});
}
