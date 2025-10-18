import { Workspace } from "@rbxts/services";
import { sounds } from "shared/assets";
import { playSound } from "shared/assets/sounds/play-sound";
import { palette } from "shared/constants/palette";
import { getPlayerByName } from "shared/utils/player-utils";

export function createRangeIndicator(range: number, position: Vector3) {
	const rangeIndicator = new Instance("Part");
	rangeIndicator.Name = "RangeIndicator";
	rangeIndicator.Shape = Enum.PartType.Cylinder;
	// Default cylinder axis is Y (vertical). Use small Y for thickness and X/Z as diameter.
	rangeIndicator.Size = new Vector3(4, range * 2, range * 2);
	rangeIndicator.CFrame = new CFrame(position).mul(CFrame.Angles(0, 0, math.rad(90)));
	rangeIndicator.Transparency = 0.9;
	rangeIndicator.Color = palette.red;
	rangeIndicator.CanCollide = false;
	rangeIndicator.Anchored = true;

	return rangeIndicator;
}

export function createAttackBeam(model: Model, targetId: string) {
	// Find the Orb part in the tower model
	const orbPart = model.FindFirstChild("Orb") as BasePart;
	if (!orbPart) {
		warn("Orb part not found in tower model");
		return;
	}

	// Resolve target (player or bot model in Workspace)
	let targetPart: BasePart | undefined;
	const player = getPlayerByName(targetId);
	if (player && player.Character) {
		const hrp = player.Character.FindFirstChild("HumanoidRootPart");
		if (hrp && hrp.IsA("BasePart")) {
			targetPart = hrp as BasePart;
		}
	}

	if (!targetPart) {
		const targetModel = Workspace.FindFirstChild(targetId);
		if (targetModel && targetModel.IsA("Model")) {
			const primary =
				(targetModel.PrimaryPart as BasePart | undefined) ??
				(targetModel.FindFirstChildWhichIsA("BasePart") as BasePart | undefined);
			if (primary) targetPart = primary;
		}
	}

	if (!targetPart) {
		warn(`No target part found for ${targetId}`);
		return;
	}

	// Create attachment points for the beam
	const attachment0 = new Instance("Attachment");
	attachment0.Parent = orbPart;

	const attachment1 = new Instance("Attachment");
	attachment1.Parent = targetPart;

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

	// Optional: looped laser sound attached to the orb part
	const sound = playSound(sounds.laser_beam, { parent: orbPart, looped: true, volume: 0.35, pitchOctave: 0.5 });

	// Auto-destroy beam if the target goes away or leaves Workspace
	const connections: RBXScriptConnection[] = [];
	connections.push(
		targetPart.Destroying.Connect(() => {
			if (beam && beam.Parent) beam.Destroy();
		}),
	);
	connections.push(
		targetPart.AncestryChanged.Connect(() => {
			if (!targetPart.IsDescendantOf(Workspace)) {
				if (beam && beam.Parent) beam.Destroy();
			}
		}),
	);

	// If target is a Player's character, remove beam when their character is removed
	if (player) {
		connections.push(
			player.CharacterRemoving.Connect(() => {
				if (beam && beam.Parent) beam.Destroy();
			}),
		);
	}

	// Clean up attachments, sound, and event connections when beam is destroyed
	beam.Destroying.Connect(() => {
		attachment0.Destroy();
		attachment1.Destroy();
		if (sound) {
			sound.Stop();
			sound.Destroy();
		}
		for (const connection of connections) {
			connection.Disconnect();
		}
	});

	return beam;
}
