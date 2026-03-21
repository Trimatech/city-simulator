import { Players } from "@rbxts/services"
import assets from "shared/assets"
import { palette } from "shared/constants/palette"
import { remotes } from "shared/remotes"
import { getPlayerByName } from "shared/utils/player-utils"
import { store } from "server/store"
import {
	identifyMilestone,
	selectMilestoneEliminationCount,
	selectMilestoneLastKilled,
	selectMilestones,
} from "server/store/milestones"
import { selectSoldierById, selectSoldierRanking } from "shared/store/soldiers"

const STREAK_THRESHOLDS = [2, 3, 5, 10] as const

const lastKillerByVictim = new Map<string, string>()
let hasFirstBlood = false

function isBotId(id: string) {
	return string.sub(id, 1, 4) === "BOT_"
}

function getDisplayName(id: string) {
	return store.getState(selectSoldierById(id))?.name ?? id
}

function sendAlert(player: Player | undefined, params: Parameters<typeof remotes.client.alert.fire>[1]) {
	if (!player) {
		return
	}

	remotes.client.alert.fire(player, params)
}

function broadcastAlert(params: Parameters<typeof remotes.client.alert.fire>[1]) {
	for (const player of Players.GetPlayers()) {
		remotes.client.alert.fire(player, params)
	}
}

function handleElimination(killerId: string, victimId: string) {
	if (killerId === "system" || killerId === victimId) {
		return
	}

	const killerName = getDisplayName(killerId)
	const victimName = getDisplayName(victimId)
	const killerPlayer = getPlayerByName(killerId)
	const victimPlayer = getPlayerByName(victimId)
	const eliminationCount = store.getState(selectMilestoneEliminationCount(killerId)) ?? 0
	const revenge = lastKillerByVictim.get(killerId) === victimId
	const victimRank = store.getState(selectSoldierRanking(victimId))

	if (!hasFirstBlood && !isBotId(victimId) && !isBotId(killerId)) {
		hasFirstBlood = true
		broadcastAlert({
			scope: "ranking",
			emoji: "🩸",
			color: palette.red,
			colorSecondary: palette.maroon,
			message: `<font color="#fff">${killerName}</font> drew first blood on <font color="#fff">${victimName}</font>!`,
			sound: assets.sounds.thump_sound,
		})
	}

	sendAlert(killerPlayer, {
		scope: "ranking",
		emoji: revenge ? "⚔️" : "☠️",
		color: revenge ? palette.peach : palette.red,
		colorSecondary: revenge ? palette.yellow : palette.maroon,
		message: revenge
			? `Revenge on <font color="#fff">${victimName}</font>!`
			: `You eliminated <font color="#fff">${victimName}</font>.`,
		sound: assets.sounds.alert_money,
	})

	sendAlert(victimPlayer, {
		scope: "ranking",
		emoji: "💀",
		color: palette.surface2,
		colorSecondary: palette.overlay1,
		message: `Taken out by <font color="#fff">${killerName}</font>.`,
		sound: assets.sounds.alert_bad,
	})

	if (STREAK_THRESHOLDS.includes(eliminationCount as never)) {
		const streakLabel = eliminationCount >= 5 ? "On fire" : "Kill streak"
		broadcastAlert({
			scope: "ranking",
			emoji: "🔥",
			color: palette.yellow,
			colorSecondary: palette.peach,
			message: `<font color="#fff">${killerName}</font> is on a ${eliminationCount} KO streak!`,
			sound: assets.sounds.bong_001,
		})

		sendAlert(killerPlayer, {
			scope: "ranking",
			emoji: "🔥",
			color: palette.yellow,
			colorSecondary: palette.peach,
			message: `${streakLabel}: <font color="#fff">${eliminationCount}</font> KOs.`,
			sound: assets.sounds.bong_001,
		})
	}

	if (victimRank === 1) {
		broadcastAlert({
			scope: "ranking",
			emoji: "👑",
			color: palette.yellow,
			colorSecondary: palette.sapphire,
			message: `<font color="#fff">${killerName}</font> just knocked out the leader!`,
			sound: assets.sounds.alert_neutral,
		})
	}

	lastKillerByVictim.set(victimId, killerId)
}

function observeMilestone(playerId: string) {
	const unsubscribeKill = store.subscribe(selectMilestoneLastKilled(playerId), (victimId) => {
		if (victimId !== undefined) {
			handleElimination(playerId, victimId)
		}
	})

	return () => {
		unsubscribeKill()
	}
}

export function initSocialFeedService() {
	store.observe(selectMilestones, identifyMilestone, (_, id) => {
		return observeMilestone(id)
	})
}
