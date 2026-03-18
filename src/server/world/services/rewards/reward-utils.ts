import { Players } from "@rbxts/services";
import { setTimeout } from "@rbxts/set-timeout";
import { store } from "server/store";
import { getRandomPointInWorld, getSoldier } from "server/world/world-query.utils";
import { IS_LOCAL } from "shared/constants/core";
import { REWARD_CONFIGS, REWARD_PICKUP_RADIUS, RewardConfig, RewardType } from "shared/constants/rewards";
import { selectSoldiersById } from "shared/store/soldiers";

import { IS_TESTING_STUFF } from "../../constants";
import { createRewardPart, markRewardCollected, removeRewardPart, type RewardPartData } from "./reward-part-manager";

export interface RewardEntity {
	readonly id: string;
	readonly rewardType: RewardType;
	readonly position: Vector2;
	readonly config: RewardConfig;
	collected: boolean;
}

const rewardsById = new Map<string, RewardEntity>();
let nextRewardId = 0;

const REMOVAL_DELAY = 0.1;

export function getActiveRewardCount(rewardType: RewardType): number {
	let count = 0;
	for (const [, reward] of rewardsById) {
		if (reward.rewardType === rewardType && !reward.collected) {
			count++;
		}
	}
	return count;
}

export function spawnRewardAt(rewardType: RewardType, position: Vector2): RewardEntity {
	const config = REWARD_CONFIGS[rewardType];
	const id = `reward_${nextRewardId++}`;

	const entity: RewardEntity = {
		id,
		rewardType,
		position,
		config,
		collected: false,
	};

	rewardsById.set(id, entity);

	const partData: RewardPartData = {
		id,
		rewardType,
		position,
		config,
	};
	createRewardPart(partData);

	print(`[Rewards] Spawned ${rewardType} reward: ${id} at (${math.floor(position.X)}, ${math.floor(position.Y)})`);

	return entity;
}

export function spawnReward(rewardType: RewardType): RewardEntity {
	if (IS_LOCAL && IS_TESTING_STUFF) {
		return spawnRewardNearPlayer(rewardType);
	}

	return spawnRewardAt(rewardType, getRandomPointInWorld(0.9));
}

const random = new Random();
const TEST_SPAWN_MIN_DISTANCE = 15;
const TEST_SPAWN_MAX_DISTANCE = 40;

function spawnRewardNearPlayer(rewardType: RewardType): RewardEntity {
	// Find the first real player's soldier
	const soldiers = store.getState(selectSoldiersById);
	let playerPos: Vector2 | undefined;

	for (const player of Players.GetPlayers()) {
		const soldier = soldiers[player.Name];
		if (soldier && !soldier.dead) {
			playerPos = soldier.position;
			break;
		}
	}

	if (playerPos) {
		const angle = random.NextNumber(0, math.pi * 2);
		const distance = random.NextNumber(TEST_SPAWN_MIN_DISTANCE, TEST_SPAWN_MAX_DISTANCE);
		const offset = new Vector2(math.cos(angle) * distance, math.sin(angle) * distance);
		return spawnRewardAt(rewardType, playerPos.add(offset));
	}

	return spawnRewardAt(rewardType, getRandomPointInWorld(0.9));
}

export function populateRewards(rewardType: RewardType): void {
	const config = REWARD_CONFIGS[rewardType];
	const currentCount = getActiveRewardCount(rewardType);
	const needed = config.initialCount - currentCount;

	for (let i = 0; i < needed; i++) {
		spawnReward(rewardType);
	}
}

function scheduleRespawn(rewardType: RewardType): void {
	const config = REWARD_CONFIGS[rewardType];
	setTimeout(() => {
		if (getActiveRewardCount(rewardType) === 0) {
			spawnReward(rewardType);
			print(`[Rewards] Respawned ${rewardType} after ${config.respawnDelay}s cooldown`);
		}
	}, config.respawnDelay);
}

export function collectReward(rewardId: string, soldierId: string): void {
	const reward = rewardsById.get(rewardId);
	if (!reward || reward.collected) return;

	const soldier = getSoldier(soldierId);
	if (!soldier) return;

	reward.collected = true;

	// Only real players (not bots) get crystals
	if (string.sub(soldierId, 1, 4) !== "BOT_") {
		store.givePlayerCrystals(soldierId, reward.config.crystalReward);
		print(
			`[Rewards] Player ${soldierId} collected ${reward.rewardType}, +${reward.config.crystalReward} crystal(s)`,
		);
	}

	markRewardCollected(rewardId);

	const rewardType = reward.rewardType;

	setTimeout(() => {
		rewardsById.delete(rewardId);
		removeRewardPart(rewardId);
	}, REMOVAL_DELAY);

	// Schedule respawn after the configured delay
	scheduleRespawn(rewardType);
}

export function checkRewardPickups(): void {
	const soldiers = store.getState(selectSoldiersById);

	for (const [, soldier] of pairs(soldiers)) {
		if (soldier.dead) continue;

		for (const [, reward] of rewardsById) {
			if (reward.collected) continue;

			const distance = soldier.position.sub(reward.position).Magnitude;
			if (distance <= REWARD_PICKUP_RADIUS) {
				collectReward(reward.id, soldier.id);
				break;
			}
		}
	}
}
