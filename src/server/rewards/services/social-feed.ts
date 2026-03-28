import { Players } from "@rbxts/services";
import { store } from "server/store";
import {
	identifyMilestone,
	selectMilestoneEliminationCount,
	selectMilestoneLastKilled,
	selectMilestoneLastKillSource,
	selectMilestones,
} from "server/store/milestones";
import assets from "shared/assets";
import { palette } from "shared/constants/palette";
import { remotes } from "shared/remotes";
import { KILL_SOURCE_LABELS, KillSource } from "shared/store/milestones/milestone-utils";
import { selectSoldierById, selectSoldierRanking } from "shared/store/soldiers";
import { getPlayerByName } from "shared/utils/player-utils";

const STREAK_THRESHOLDS = [2, 3, 5, 10] as const;

const lastKillerByVictim = new Map<string, string>();
let hasFirstBlood = false;

const SELF_KILL_MESSAGES = [
	"just played themselves 🤡",
	"forgot how lines work",
	"tried to speedrun death",
	"is their own worst enemy",
	"took themselves out. impressive.",
	"discovered friendly fire",
	"needs a tutorial",
	"just... why?",
	"eliminated their biggest threat: themselves",
	"rage quit on life",
] as const;

const SYSTEM_KILL_MESSAGES = [
	"got erased from existence",
	"was caught in the crossfire",
	"didn't see that coming",
	"got wiped off the map",
	"ceased to exist",
	"was in the wrong place at the wrong time",
	"got vaporized",
] as const;

function isBotId(id: string) {
	return string.sub(id, 1, 4) === "BOT_";
}

function getDisplayName(id: string) {
	return store.getState(selectSoldierById(id))?.name ?? id;
}

function sendAlert(player: Player | undefined, params: Parameters<typeof remotes.client.alert.fire>[1]) {
	if (!player) {
		return;
	}

	remotes.client.alert.fire(player, params);
}

function broadcastAlert(params: Parameters<typeof remotes.client.alert.fire>[1]) {
	for (const player of Players.GetPlayers()) {
		remotes.client.alert.fire(player, params);
	}
}

function getRandomSelfKillMessage() {
	return SELF_KILL_MESSAGES[math.random(0, SELF_KILL_MESSAGES.size() - 1)];
}

function getRandomSystemKillMessage() {
	return SYSTEM_KILL_MESSAGES[math.random(0, SYSTEM_KILL_MESSAGES.size() - 1)];
}

function getKillSourceSuffix(killSource?: KillSource): string {
	if (!killSource) return "";
	const label = KILL_SOURCE_LABELS[killSource];
	return label ? ` with <font color="#ccc">${label}</font>` : "";
}

function handleElimination(killerId: string, victimId: string) {
	const killSource = store.getState(selectMilestoneLastKillSource(killerId));
	const sourceSuffix = getKillSourceSuffix(killSource);

	if (killerId === "system") {
		const victimName = getDisplayName(victimId);
		const sourceLabel = killSource ? KILL_SOURCE_LABELS[killSource] : undefined;
		const message = sourceLabel
			? `got wiped by <font color="#ccc">${sourceLabel}</font>`
			: getRandomSystemKillMessage();

		broadcastAlert({
			scope: "ranking",
			emoji: "💥",
			color: palette.overlay1,
			colorSecondary: palette.surface2,
			message: `<font color="#fff">${victimName}</font> ${message}`,
		});

		return;
	}

	if (killerId === victimId) {
		const name = getDisplayName(killerId);
		const message = getRandomSelfKillMessage();

		broadcastAlert({
			scope: "ranking",
			emoji: "🤦",
			color: palette.overlay1,
			colorSecondary: palette.surface2,
			message: `<font color="#fff">${name}</font> ${message}`,
		});

		return;
	}

	const killerName = getDisplayName(killerId);
	const victimName = getDisplayName(victimId);
	const killerPlayer = getPlayerByName(killerId);
	const victimPlayer = getPlayerByName(victimId);
	const eliminationCount = store.getState(selectMilestoneEliminationCount(killerId)) ?? 0;
	const revenge = lastKillerByVictim.get(killerId) === victimId;
	const victimRank = store.getState(selectSoldierRanking(victimId));

	if (!hasFirstBlood && !isBotId(victimId) && !isBotId(killerId)) {
		hasFirstBlood = true;
		broadcastAlert({
			scope: "ranking",
			emoji: "🩸",
			color: palette.red,
			colorSecondary: palette.maroon,
			message: `<font color="#fff">${killerName}</font> drew first blood on <font color="#fff">${victimName}</font>!`,
			sound: assets.sounds.thump_sound,
		});
	}

	sendAlert(killerPlayer, {
		scope: "ranking",
		emoji: revenge ? "⚔️" : "☠️",
		color: revenge ? palette.peach : palette.red,
		colorSecondary: revenge ? palette.yellow : palette.maroon,
		message: revenge
			? `Revenge on <font color="#fff">${victimName}</font>${sourceSuffix}!`
			: `You eliminated <font color="#fff">${victimName}</font>${sourceSuffix}.`,
		sound: assets.sounds.alert_money,
	});

	sendAlert(victimPlayer, {
		scope: "ranking",
		emoji: "💀",
		color: palette.surface2,
		colorSecondary: palette.overlay1,
		message: `Taken out by <font color="#fff">${killerName}</font>${sourceSuffix}.`,
		sound: assets.sounds.alert_bad,
	});

	if (STREAK_THRESHOLDS.includes(eliminationCount as never)) {
		const streakLabel = eliminationCount >= 5 ? "On fire" : "Kill streak";
		broadcastAlert({
			scope: "ranking",
			emoji: "🔥",
			color: palette.yellow,
			colorSecondary: palette.peach,
			message: `<font color="#fff">${killerName}</font> is on a ${eliminationCount} KO streak!`,
			sound: assets.sounds.bong_001,
		});

		sendAlert(killerPlayer, {
			scope: "ranking",
			emoji: "🔥",
			color: palette.yellow,
			colorSecondary: palette.peach,
			message: `${streakLabel}: <font color="#fff">${eliminationCount}</font> KOs.`,
			sound: assets.sounds.bong_001,
		});
	}

	if (victimRank === 1) {
		broadcastAlert({
			scope: "ranking",
			emoji: "👑",
			color: palette.yellow,
			colorSecondary: palette.sapphire,
			message: `<font color="#fff">${killerName}</font> just knocked out the leader!`,
			sound: assets.sounds.alert_neutral,
		});
	}

	lastKillerByVictim.set(victimId, killerId);
}

function observeMilestone(playerId: string) {
	const unsubscribeKill = store.subscribe(selectMilestoneLastKilled(playerId), (victimId) => {
		if (victimId !== undefined) {
			handleElimination(playerId, victimId);
		}
	});

	return () => {
		unsubscribeKill();
	};
}

export function initSocialFeedService() {
	store.observe(selectMilestones, identifyMilestone, (_, id) => {
		return observeMilestone(id);
	});
}
