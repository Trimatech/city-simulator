import { Players } from "@rbxts/services";
import { store } from "server/store";
import assets from "shared/assets";
import {
	DAILY_REWARD_CYCLE,
	DAILY_STREAK_WINDOW,
	getDailyRewardAmount,
	SECONDS_PER_DAY,
} from "shared/constants/daily-rewards";
import { palette } from "shared/constants/palette";
import { remotes } from "shared/remotes";
import { selectPlayerDailyStreak, selectPlayerLastDailyRewardClaim } from "shared/store/saves";
import { onPlayerAdded } from "shared/utils/player-utils";

export async function initDailyRewardService() {
	onPlayerAdded((player) => {
		// Delay to ensure save data is loaded first
		task.delay(2, () => {
			if (!player.IsDescendantOf(Players)) return;
			checkAndNotify(player);
		});
	});

	remotes.dailyReward.claim.connect((player) => {
		processClaim(player);
	});
}

function calculateStreak(lastClaim: number, currentStreak: number): number | undefined {
	const now = os.time();
	const elapsed = now - lastClaim;

	// Already claimed today
	if (lastClaim > 0 && elapsed < SECONDS_PER_DAY) {
		return undefined;
	}

	// First time or streak broken
	if (lastClaim === 0 || elapsed >= DAILY_STREAK_WINDOW) {
		return 1;
	}

	// Within 24h-48h window — streak continues
	return (currentStreak % DAILY_REWARD_CYCLE) + 1;
}

function checkAndNotify(player: Player) {
	const lastClaim = store.getState(selectPlayerLastDailyRewardClaim(player.Name));
	const currentStreak = store.getState(selectPlayerDailyStreak(player.Name));

	const newStreak = calculateStreak(lastClaim, currentStreak);
	if (newStreak === undefined) return;

	const rewardAmount = getDailyRewardAmount(newStreak);
	remotes.dailyReward.notify.fire(player, newStreak, rewardAmount);
}

function processClaim(player: Player) {
	const lastClaim = store.getState(selectPlayerLastDailyRewardClaim(player.Name));
	const currentStreak = store.getState(selectPlayerDailyStreak(player.Name));

	const newStreak = calculateStreak(lastClaim, currentStreak);
	if (newStreak === undefined) return;

	const rewardAmount = getDailyRewardAmount(newStreak);
	const now = os.time();

	store.claimDailyReward(player.Name, newStreak, rewardAmount, now);

	remotes.client.alert.fire(player, {
		emoji: "🎁",
		color: palette.yellow,
		message: `Day ${newStreak}: +${rewardAmount} crystal${rewardAmount > 1 ? "s" : ""}!`,
		sound: assets.sounds.alert_money,
	});
}
