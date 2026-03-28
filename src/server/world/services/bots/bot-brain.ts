import { Workspace } from "@rbxts/services";
import { store } from "server/store";
import { INITIAL_POLYGON_DIAMETER } from "shared/constants/core";
import { POWERUP_PRICES } from "shared/constants/powerups";
import { selectSoldierById } from "shared/store/soldiers";

import {
	getEnemiesInRadius,
	getEnemyWithExposedTrail,
	getNearestEnemyPolygonEdgePoint,
} from "./bot-awareness";
import { buildBlobCut, buildRectCut } from "./bot-cuts";
import { buildRaidPath, buildTrailHuntPath } from "./strategies/attack-strategy";
import { buildDiscoverPath } from "./strategies/discover-strategy";
import { buildRetreatPath } from "./strategies/retreat-strategy";
import { executePowerupForSoldier } from "../powerups/powerups.service";

export type BotStrategy = "circularCut" | "discover" | "attack" | "retreat";

const INITIAL_AREA = math.pi * math.pow(INITIAL_POLYGON_DIAMETER / 2, 2);

interface BrainResult {
	readonly strategy: BotStrategy;
	readonly waypoints: Vector2[];
}

/**
 * Evaluates the bot's current state and selects a strategy with waypoints.
 * Priority order: retreat (low HP) → attack (exposed trails / territory raids) → discover → default blob cut.
 * Each priority has a random chance gate to add unpredictability.
 */
export function evaluateStrategy(botId: string, botPosition: Vector2): BrainResult {
	const soldier = store.getState(selectSoldierById(botId));
	if (!soldier || soldier.dead) {
		return { strategy: "circularCut", waypoints: buildBlobCut(botId, botPosition) };
	}

	const random = new Random();
	const healthPercent = soldier.health / soldier.maxHealth;
	const area = soldier.polygonAreaSize;
	const orbs = soldier.orbs;
	const now = Workspace.GetServerTimeNow();
	const hasShield = soldier.shieldActiveUntil > now;
	const hasTurbo = soldier.turboActiveUntil > now;

	// --- Priority 1: RETREAT if low health (high chance, not 100%) ---
	if (healthPercent < 0.3 && random.NextNumber() < 0.8) {
		const waypoints = buildRetreatPath(botId, botPosition);
		if (waypoints.size() > 0) {
			return { strategy: "retreat", waypoints };
		}
	}

	// --- Priority 2: RETREAT if enemy nearby and hurt (50% chance) ---
	if (healthPercent < 0.6 && random.NextNumber() < 0.5) {
		const nearbyEnemies = getEnemiesInRadius(botId, botPosition, 40);
		if (nearbyEnemies.size() > 0) {
			const waypoints = buildRetreatPath(botId, botPosition);
			if (waypoints.size() > 0) {
				return { strategy: "retreat", waypoints };
			}
		}
	}

	// --- Priority 3: ATTACK (trail hunt) — 60% chance when conditions met ---
	if (healthPercent > 0.5 && random.NextNumber() < 0.6) {
		const exposed = getEnemyWithExposedTrail(botId, botPosition, 80);
		if (exposed !== undefined) {
			if (!hasShield && orbs >= POWERUP_PRICES.shield) {
				executePowerupForSoldier(botId, "shield", { skipCost: false });
			}
			const waypoints = buildTrailHuntPath(botId, botPosition, exposed.enemy.id);
			if (waypoints.size() > 0) {
				return { strategy: "attack", waypoints };
			}
		}
	}

	// --- Priority 4: ATTACK (territory raid) — 40% chance when conditions met ---
	if (area > INITIAL_AREA * 3 && healthPercent > 0.7 && random.NextNumber() < 0.4) {
		const enemyEdge = getNearestEnemyPolygonEdgePoint(botId, botPosition);
		if (enemyEdge !== undefined) {
			const distToEnemyEdge = enemyEdge.point.sub(botPosition).Magnitude;
			if (distToEnemyEdge < 100) {
				if (!hasTurbo && orbs >= POWERUP_PRICES.turbo) {
					executePowerupForSoldier(botId, "turbo", { skipCost: false });
				}
				const waypoints = buildRaidPath(botId, botPosition, enemyEdge.enemyId);
				if (waypoints.size() > 0) {
					return { strategy: "attack", waypoints };
				}
			}
		}
	}

	// --- Priority 5: DISCOVER — only 30% chance even when conditions met ---
	if (area < INITIAL_AREA * 2 && random.NextNumber() < 0.3) {
		const waypoints = buildDiscoverPath(botId, botPosition);
		if (waypoints.size() > 0) {
			return { strategy: "discover", waypoints };
		}
	}

	// --- Default: random blob or rect cut (the bread and butter) ---
	const roll = random.NextNumber();
	if (roll > 0.7) {
		const waypoints = buildRectCut(botId, botPosition);
		if (waypoints.size() > 0) {
			return { strategy: "circularCut", waypoints };
		}
	}
	return { strategy: "circularCut", waypoints: buildBlobCut(botId, botPosition) };
}
