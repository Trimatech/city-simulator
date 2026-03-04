import { Workspace } from "@rbxts/services";
import assets from "shared/assets";
import { playSound } from "shared/assetsFolder/sounds/play-sound";
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
	print("Tower.utils.createAttackBeam", model, targetId);
	// Find the Orb part in the tower model
	const orbPart = model.FindFirstChild("Orb") as BasePart;
	if (!orbPart) {
		warn("Orb part not found in tower model");
		return;
	}

	// Find the startAttachment in the Orb
	const startAttachment = orbPart.FindFirstChild("startAttachment") as Attachment;
	if (!startAttachment) {
		warn("startAttachment not found in Orb");
		return;
	}

	// Find the endAttachment in the Orb
	const endAttachment = orbPart.FindFirstChild("endAttachment") as Attachment;
	if (!endAttachment) {
		warn("endAttachment not found in Orb");
		return;
	}

	// Find all beams in startAttachment
	const pulseBeam = startAttachment.FindFirstChild("pulseBeam") as Beam;
	const middleBeam = startAttachment.FindFirstChild("middleBeam") as Beam;
	const thickBeam = startAttachment.FindFirstChild("thickBeam") as Beam;

	// Find specsEffect in endAttachment
	const specsEffect = endAttachment.FindFirstChild("specsEffect") as Beam;

	if (!pulseBeam) {
		warn("pulseBeam not found in startAttachment");
		return;
	}

	// Disable all beams initially on load
	pulseBeam.Enabled = false;
	if (middleBeam) middleBeam.Enabled = false;
	if (thickBeam) thickBeam.Enabled = false;
	if (specsEffect) specsEffect.Enabled = false;

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

	// Create attachment on the target
	const targetAttachment = new Instance("Attachment");
	targetAttachment.Parent = targetPart;

	// Configure the beams to point at the target
	pulseBeam.Attachment0 = startAttachment;
	pulseBeam.Attachment1 = targetAttachment;

	if (middleBeam) {
		middleBeam.Attachment0 = startAttachment;
		middleBeam.Attachment1 = targetAttachment;
	}

	if (thickBeam) {
		thickBeam.Attachment0 = startAttachment;
		thickBeam.Attachment1 = targetAttachment;
	}

	// Enable all beams - we're always attacking while target exists
	pulseBeam.Enabled = true;
	if (middleBeam) middleBeam.Enabled = true;
	if (thickBeam) thickBeam.Enabled = true;
	if (specsEffect) specsEffect.Enabled = true;

	// Play continuous laser sound
	const sound = playSound(assets.sounds.laser_beam, { parent: orbPart, looped: true, volume: 0.35, pitchOctave: 0.5 });

	// Auto-destroy beam attachments if the target goes away or leaves Workspace
	const connections: RBXScriptConnection[] = [];
	let isCleanedUp = false;

	const cleanup = () => {
		print("Tower.utils.createAttackBeam.cleanup");
		if (isCleanedUp) return;
		isCleanedUp = true;

		// Disable all beams
		pulseBeam.Enabled = false;
		if (middleBeam) middleBeam.Enabled = false;
		if (thickBeam) thickBeam.Enabled = false;
		if (specsEffect) specsEffect.Enabled = false;

		// Stop and destroy sound
		if (sound) {
			sound.Stop();
			sound.Destroy();
		}

		targetAttachment.Destroy();
		for (const connection of connections) {
			connection.Disconnect();
		}
	};

	connections.push(
		targetPart.Destroying.Connect(() => {
			cleanup();
		}),
	);
	connections.push(
		targetPart.AncestryChanged.Connect(() => {
			if (!targetPart.IsDescendantOf(Workspace)) {
				cleanup();
			}
		}),
	);

	// If target is a Player's character, cleanup when their character is removed
	if (player) {
		connections.push(
			player.CharacterRemoving.Connect(() => {
				cleanup();
			}),
		);
	}

	return { cleanup };
}
