import Object from "@rbxts/object-utils";
import { setTimeout } from "@rbxts/set-timeout";
import { store } from "server/store";
import { getPlayerHumanoidByName, killSoldier } from "server/world/world.utils";
import { sounds } from "shared/assets";
import { SOLDIER_SPEED } from "shared/constants/core";
import { palette } from "shared/constants/palette";
import {
	POWERUP_DURATIONS,
	POWERUP_EXPLOSIONS,
	POWERUP_PRICES,
	POWERUP_TURBO_SPEEDS,
	PowerupId,
} from "shared/constants/powerups";
import { remotes } from "shared/remotes";
import { selectSoldierById, selectSoldierOrbs, selectSoldiersById } from "shared/store/soldiers";
import { selectTowersById } from "shared/store/towers/tower-selectors";

import { placeTower } from "../soldiers/soldiers.placeTower";

const shieldUntilBySoldier = new Map<string, number>();

export function hasShield(soldierId: string) {
	const expiresAt = shieldUntilBySoldier.get(soldierId);
	return expiresAt !== undefined && expiresAt > tick();
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

function useTurbo(player: Player, id: PowerupId) {
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

function useShield(player: Player) {
	const playerName = player.Name;
	if (!trySpendOrbs(playerName, POWERUP_PRICES.shield)) {
		alert(player, "Not enough orbs!", palette.red);
		return;
	}
	const expiresAt = tick() + POWERUP_DURATIONS.shield;
	shieldUntilBySoldier.set(playerName, expiresAt);
	setTimeout(() => {
		const current = shieldUntilBySoldier.get(playerName);
		if (current && current <= tick()) {
			shieldUntilBySoldier.delete(playerName);
		}
	}, POWERUP_DURATIONS.shield);
	alert(player, "Shield Dome activated!", palette.green);
}

function useBuildTower(player: Player) {
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

function useExplosion(player: Player, kind: "explosion" | "megaExplosion") {
	const playerName = player.Name;
	const cfg = POWERUP_EXPLOSIONS[kind];
	const cost = POWERUP_PRICES[kind];
	if (!trySpendOrbs(playerName, cost)) {
		alert(player, "Not enough orbs!", palette.red);
		return;
	}
	const centerSoldier = store.getState(selectSoldierById(playerName));
	if (!centerSoldier) return;
	const center = centerSoldier.position;

	// Affect enemy soldiers
	const soldiers = store.getState(selectSoldiersById);
	for (const [, s] of Object.entries(soldiers)) {
		if (!s || s.dead || s.id === playerName) continue;
		if (magnitude2D(s.position, center) <= cfg.radius) {
			if (kind === "megaExplosion") {
				killSoldier(s.id);
			} else {
				// push and damage
				const h = getPlayerHumanoidByName(s.id);
				if (h) pushHumanoidAway(h, new Vector3(center.X, 0, center.Y), 60);
				const h2 = getPlayerHumanoidByName(s.id);
				if (h2) h2.TakeDamage(cfg.damage);
			}
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

	alert(player, kind === "megaExplosion" ? "Mega Explosion triggered!" : "Explosion triggered!", palette.green);
}

export async function initPowerupService() {
	remotes.powerups.use.connect((player, id) => {
		const soldier = store.getState(selectSoldierById(player.Name));
		if (!soldier || soldier.dead) return;
		switch (id as PowerupId) {
			case "turbo":
				useTurbo(player, "turbo");
				break;
			case "turbo2x":
				useTurbo(player, "turbo2x");
				break;
			case "shield":
				useShield(player);
				break;
			case "tower":
				useBuildTower(player);
				break;
			case "explosion":
				useExplosion(player, "explosion");
				break;
			case "megaExplosion":
				useExplosion(player, "megaExplosion");
				break;
			default:
				warn(`Unknown powerup id ${id}`);
		}
	});
}
