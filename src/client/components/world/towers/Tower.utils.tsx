import { palette } from "shared/constants/palette";
import { getPlayerByName } from "shared/utils/player-utils";

export function createRangeIndicator(range: number, position: Vector3) {
	const rangeIndicator = new Instance("Part");
	rangeIndicator.Name = "RangeIndicator";
	rangeIndicator.Shape = Enum.PartType.Cylinder;
	rangeIndicator.Size = new Vector3(1.1, range * 2, range * 2);
	rangeIndicator.CFrame = new CFrame(position).mul(CFrame.Angles(0, 0, math.pi / 2));
	rangeIndicator.Transparency = 0.9;
	rangeIndicator.Color = palette.red;
	rangeIndicator.CanCollide = false;
	rangeIndicator.Anchored = true;

	return rangeIndicator;
}

export function createAttackBeam(model: Model, playerName: string) {
	// Find the Orb part in the tower model
	const orbPart = model.FindFirstChild("Orb") as BasePart;
	if (!orbPart) {
		warn("Orb part not found in tower model");
		return;
	}

	// Find the target player's character
	const player = getPlayerByName(playerName);
	if (!player?.Character) {
		warn("Player character not found for beam target");
		return;
	}

	// Get the humanoid root part as the target
	const humanoidRootPart = player.Character.FindFirstChild("HumanoidRootPart") as BasePart;
	if (!humanoidRootPart) {
		warn("HumanoidRootPart not found for beam target");
		return;
	}

	// Create attachment points for the beam
	const attachment0 = new Instance("Attachment");
	attachment0.Parent = orbPart;

	const attachment1 = new Instance("Attachment");
	attachment1.Parent = humanoidRootPart;

	// Create the beam
	const beam = new Instance("Beam");
	beam.Attachment0 = attachment0;
	beam.Attachment1 = attachment1;
	beam.Width0 = 0.3;
	beam.Width1 = 0.1;
	beam.FaceCamera = true;
	beam.Transparency = new NumberSequence([new NumberSequenceKeypoint(0, 0), new NumberSequenceKeypoint(1, 0.5)]);
	beam.Color = new ColorSequence([
		new ColorSequenceKeypoint(0, new Color3(1, 0, 0)),
		new ColorSequenceKeypoint(1, new Color3(1, 0.5, 0)),
	]);
	beam.Parent = model;

	// Clean up attachments when beam is destroyed
	beam.Destroying.Connect(() => {
		attachment0.Destroy();
		attachment1.Destroy();
	});

	return beam;
}
