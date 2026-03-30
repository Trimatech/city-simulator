import { Workspace } from "@rbxts/services";
import { remotes } from "shared/remotes";
import { RAGDOLL_DURATION_SEC, ragdollCharacter } from "shared/utils/ragdoll";

function handleRagdoll(characterName: string) {
	const character = Workspace.FindFirstChild(characterName);
	if (!character || !character.IsA("Model")) return;

	// Clone the character for client-side ragdoll
	const prev = character.Archivable;
	character.Archivable = true;
	const clone = character.Clone();
	character.Archivable = prev;

	clone.Name = `${characterName}_ragdoll`;
	clone.Parent = Workspace;

	// Hide the original character
	character.GetDescendants().forEach((inst) => {
		if (inst.IsA("BasePart")) {
			inst.Transparency = 1;
			inst.CanCollide = false;
		}
	});

	// Apply ragdoll physics to the clone
	const destroyRagdoll = ragdollCharacter(clone, 30);
	task.delay(RAGDOLL_DURATION_SEC, destroyRagdoll);
}

export function initializeRagdollEffects() {
	const disconnect = remotes.client.ragdoll.connect(handleRagdoll);
	return () => disconnect();
}
