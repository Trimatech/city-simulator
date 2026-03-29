import { Players } from "@rbxts/services";
import { store } from "server/store";
import { killSoldier, onPlayerDeath } from "server/world";
import { Badge } from "shared/assetsFolder";
import { WORLD_BOUNDS } from "shared/constants/core";
import { palette } from "shared/constants/palette";
import { remotes } from "shared/remotes";
import { selectSoldiersById } from "shared/store/soldiers";
import { getPlayerByName } from "shared/utils/player-utils";

import { grantMoney } from "../utils";
import { tryGrantBadge } from "./badges";

const WORLD_AREA = math.pi * math.pow(WORLD_BOUNDS, 2);
const WIN_THRESHOLD = 0.9; // 90% of world area
const WIN_MONEY_REWARD = 50_000;
const WIN_CRYSTAL_REWARD = 5;
const WIN_COUNTDOWN_SEC = 15;

let winInProgress = false;

export function initWinConditionService() {
	store.subscribe(selectSoldiersById, (soldiersById) => {
		if (winInProgress) return;

		for (const [, soldier] of pairs(soldiersById)) {
			if (!soldier || soldier.dead) continue;

			const areaShare = soldier.polygonAreaSize / WORLD_AREA;
			if (areaShare >= WIN_THRESHOLD) {
				triggerWorldDominationWin(soldier.id, soldier.name, soldier.polygonAreaSize, soldier.eliminations);
				return;
			}
		}
	});
}

function triggerWorldDominationWin(winnerId: string, winnerName: string, areaSize: number, eliminations: number) {
	if (winInProgress) return;
	winInProgress = true;

	const areaPercent = math.floor((areaSize / WORLD_AREA) * 100);

	// Grant rewards to winner
	const winnerPlayer = getPlayerByName(winnerId);
	let moneyEarned = 0;
	if (winnerPlayer) {
		moneyEarned = grantMoney(winnerPlayer, WIN_MONEY_REWARD);
		store.givePlayerCrystals(winnerId, WIN_CRYSTAL_REWARD);
		tryGrantBadge(winnerId, Badge.WORLD_DOMINATOR);
	}

	// Get winner UserId for avatar
	const winnerUserId = winnerPlayer?.UserId ?? 0;

	// Kill all other soldiers (not the winner)
	const soldiersById = store.getState(selectSoldiersById);
	for (const [, soldier] of pairs(soldiersById)) {
		if (!soldier || soldier.id === winnerId) continue;
		if (!soldier.dead) {
			onPlayerDeath(soldier.id, winnerId, "world-domination");
			// Immediately finalize kill (skip revive window)
			task.defer(() => killSoldier(soldier.id));
		}
	}

	// Now kill the winner too (game is over)
	task.defer(() => {
		const winner = store.getState(selectSoldiersById)[winnerId];
		if (winner && !winner.dead) {
			store.setSoldierIsDead(winnerId);
			killSoldier(winnerId);
		}
	});

	// Broadcast win event to all clients
	for (const player of Players.GetPlayers()) {
		remotes.client.worldDominationWin.fire(
			player,
			winnerId,
			winnerName,
			winnerUserId,
			areaPercent,
			eliminations,
			moneyEarned,
			WIN_CRYSTAL_REWARD,
		);
	}

	// Broadcast alert
	for (const player of Players.GetPlayers()) {
		remotes.client.alert.fire(player, {
			scope: "ranking",
			emoji: "👑",
			color: palette.yellow,
			colorSecondary: palette.peach,
			message: `<font color="#fff">${winnerName}</font> has achieved <font color="#FFD700">WORLD DOMINATION</font>! ${areaPercent}% conquered!`,
		});
	}

	// After countdown, allow new games
	task.delay(WIN_COUNTDOWN_SEC, () => {
		winInProgress = false;
	});
}
