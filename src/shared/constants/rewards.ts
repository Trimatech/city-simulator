import { palette } from "./palette";

// CollectionService tag for reward parts
export const REWARD_TAG = "GameReward";

// Reward attributes set on each Part for client-side animation
export const REWARD_ATTR_ID = "RewardId";
export const REWARD_ATTR_TYPE = "RewardType";
export const REWARD_ATTR_TIME_ADDED = "RewardTimeAdded";
export const REWARD_ATTR_COLLECTED = "RewardCollected";

// Reward spawn/animation constants
export const REWARD_GROUND_Y = 3;
export const REWARD_TARGET_Y = 4;
export const REWARD_PICKUP_RADIUS = 4.5;
export const REWARD_SPAWN_ANIMATION_DURATION = 0.8;
export const REWARD_COLLECT_ANIMATION_DURATION = 1.2;
export const REWARD_COLLECT_FLOAT_HEIGHT = 20;

// Beam visual constants
export const REWARD_BEAM_HEIGHT = 60;
export const REWARD_BEAM_WIDTH = 3;
export const REWARD_BEAM_WIDTH_TOP = 0.5;

// Reward pickup tick runs once per minute (in seconds)
export const REWARD_TICK_INTERVAL = 1;

export enum RewardType {
	Revive = "revive",
}

export interface RewardConfig {
	readonly type: RewardType;
	readonly displayName: string;
	readonly modelPath: string;
	readonly beamColor: Color3;
	readonly initialCount: number;
	readonly initialDelay: number;
	readonly spawnCount: number;
	readonly spawnInterval: number;
	readonly crystalReward: number;
	readonly test: boolean;
}

export const REWARD_CONFIGS: { readonly [K in RewardType]: RewardConfig } = {
	[RewardType.Revive]: {
		type: RewardType.Revive,
		displayName: "Crystal",
		modelPath: "ReplicatedStorage/Models/Gameplay/ForceFieldCrystal",
		beamColor: palette.sapphire,
		initialCount: 1,
		initialDelay: 5,
		spawnCount: 1,
		spawnInterval: 300,
		crystalReward: 1,
		test: true,
	},
};
