import { CollectionService, ReplicatedStorage, Workspace } from "@rbxts/services";
import {
	REWARD_ATTR_COLLECTED,
	REWARD_ATTR_ID,
	REWARD_ATTR_TIME_ADDED,
	REWARD_ATTR_TYPE,
	REWARD_BEAM_HEIGHT,
	REWARD_BEAM_WIDTH,
	REWARD_BEAM_WIDTH_TOP,
	REWARD_GROUND_Y,
	REWARD_TAG,
	RewardConfig,
} from "shared/constants/rewards";

let rewardsFolder: Folder | undefined;

function ensureRewardsFolder(): Folder {
	if (!rewardsFolder) {
		rewardsFolder = new Instance("Folder");
		rewardsFolder.Name = "ServerRewards";
		rewardsFolder.Parent = Workspace;
	}
	return rewardsFolder;
}

const rewardModels = new Map<string, Model>();

export interface RewardPartData {
	readonly id: string;
	readonly rewardType: string;
	readonly position: Vector2;
	readonly config: RewardConfig;
}

function resolveModel(modelPath: string): Model | undefined {
	const parts = modelPath.split("/");
	let current: Instance = ReplicatedStorage;
	// Skip "ReplicatedStorage" prefix
	for (let i = 1; i < parts.size(); i++) {
		const child = current.FindFirstChild(parts[i]);
		if (!child) {
			warn(`[Rewards] Model path segment "${parts[i]}" not found in ${current.GetFullName()}`);
			return undefined;
		}
		current = child;
	}
	if (current.IsA("Model")) return current;
	warn(`[Rewards] Resolved path is not a Model: ${current.GetFullName()}`);
	return undefined;
}

export function createRewardPart(data: RewardPartData): Model | undefined {
	const { id, rewardType, position, config } = data;

	// Clone the model from ReplicatedStorage
	const sourceModel = resolveModel(config.modelPath);
	if (!sourceModel) {
		warn(`[Rewards] Could not find model at ${config.modelPath}`);
		return undefined;
	}

	const model = sourceModel.Clone();
	model.Name = `reward_${id}`;

	const ySize = model.GetExtentsSize().Y;

	// Position the model in the world, rotated upright (-90° on X to stand it up)
	const worldPos = new Vector3(position.X, ySize / 2 + REWARD_GROUND_Y, position.Y);
	model.PivotTo(new CFrame(worldPos));

	// Find the primary part (or first BasePart) to attach beam and attributes
	const primaryPart = model.PrimaryPart ?? (model.FindFirstChildWhichIsA("BasePart") as BasePart | undefined);

	if (primaryPart) {
		// Set attributes on primary part for client-side animation
		primaryPart.SetAttribute(REWARD_ATTR_ID, id);
		primaryPart.SetAttribute(REWARD_ATTR_TYPE, rewardType);
		primaryPart.SetAttribute(REWARD_ATTR_TIME_ADDED, Workspace.GetServerTimeNow());
		primaryPart.SetAttribute(REWARD_ATTR_COLLECTED, false);

		const baseAttachment = new Instance("Attachment");
		baseAttachment.Name = "BeamBase";
		baseAttachment.Position = new Vector3(0, 0, 0);
		baseAttachment.Parent = primaryPart;

		const topAttachment = new Instance("Attachment");
		topAttachment.Name = "BeamTop";
		topAttachment.Position = new Vector3(0, REWARD_BEAM_HEIGHT, 0);
		topAttachment.Parent = primaryPart;

		const beam = new Instance("Beam");
		beam.Name = "RewardBeam";
		beam.Attachment0 = baseAttachment;
		beam.Attachment1 = topAttachment;
		beam.Color = new ColorSequence(config.beamColor);
		beam.LightEmission = 1;
		beam.LightInfluence = 0;
		beam.FaceCamera = true;
		beam.Width0 = REWARD_BEAM_WIDTH;
		beam.Width1 = REWARD_BEAM_WIDTH_TOP;
		beam.Transparency = new NumberSequence([
			new NumberSequenceKeypoint(0, 1),
			new NumberSequenceKeypoint(0.15, 0.2),
			new NumberSequenceKeypoint(0.5, 0.5),
			new NumberSequenceKeypoint(1, 1),
		]);
		beam.Segments = 10;
		beam.Parent = primaryPart;
		// Ground glow
		// const pointLight = new Instance("PointLight");
		// pointLight.Name = "RewardGlow";
		// pointLight.Color = config.beamColor;
		// pointLight.Brightness = 2;
		// pointLight.Range = 20;
		// pointLight.Parent = primaryPart;
		// Tag the primary part for CollectionService
		CollectionService.AddTag(primaryPart, REWARD_TAG);
	}

	model.Parent = ensureRewardsFolder();
	rewardModels.set(id, model);

	return model;
}

export function markRewardCollected(rewardId: string): void {
	const model = rewardModels.get(rewardId);
	if (!model) return;

	const primaryPart = model.PrimaryPart ?? (model.FindFirstChildWhichIsA("BasePart") as BasePart | undefined);
	if (primaryPart) {
		primaryPart.SetAttribute(REWARD_ATTR_COLLECTED, true);
	}
}

export function removeRewardPart(rewardId: string): void {
	const model = rewardModels.get(rewardId);
	if (model) {
		model.Destroy();
		rewardModels.delete(rewardId);
	}
}
