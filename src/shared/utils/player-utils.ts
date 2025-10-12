import { Players } from "@rbxts/services";
import { promiseTree } from "@rbxts/validate-tree";

const characterSchema = {
	$className: "Model",
	HumanoidRootPart: "BasePart",
	Humanoid: {
		$className: "Humanoid",
		Animator: "Animator",
	},
} as const;

export interface Character extends Model {
	HumanoidRootPart: BasePart;
	Humanoid: Humanoid & {
		Animator: Animator;
	};
}

export async function promiseCharacter(character: Model): Promise<Character> {
	return promiseTree(character, characterSchema).timeout(30, "Character timed out");
}

export async function promisePlayerDisconnected(player: Player): Promise<void> {
	if (!player.IsDescendantOf(Players)) {
		return;
	}

	await Promise.fromEvent(Players.PlayerRemoving, (playerWhoLeft) => playerWhoLeft === player);
}

export function getPlayerByName(name: string) {
	const player = Players.FindFirstChild(name);

	if (player?.IsA("Player")) {
		return player;
	}
}

export function onPlayerAdded(callback: (player: Player) => void) {
	const connection = Players.PlayerAdded.Connect(callback);

	for (const player of Players.GetPlayers()) {
		callback(player);
	}

	return () => connection.Disconnect();
}

export function findCharacterPrimaryPart(character: Model, timeoutSeconds = 10): BasePart | undefined {
	const hrp = character.FindFirstChild("HumanoidRootPart");
	if (hrp && hrp.IsA("BasePart")) {
		return hrp as BasePart;
	}

	print("HumanoidRootPart not found, waiting for it");

	const waited = character.WaitForChild("HumanoidRootPart", timeoutSeconds) as Instance | undefined;
	if (waited && waited.IsA("BasePart")) {
		print("HumanoidRootPart found after waiting");
		return waited as BasePart;
	}

	const first = character.FindFirstChildWhichIsA("BasePart");
	if (first) {
		print("HumanoidRootPart found in FindFirstChildWhichIsA");
		return first;
	}

	return undefined;
}

export function reloadCharacterAsync(player: Player): Promise<Model> {
	return new Promise((resolve) => {
		player.CharacterAdded.Once((char) => {
			char.WaitForChild("Humanoid");
			print("Character loaded");
			resolve(char);
		});
		player.LoadCharacter();
	});
}
