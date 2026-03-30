import { CollisionGroups } from "shared/constants/collision-groups";
import { SOLDIER_SPEED } from "shared/constants/core";
import { Character, onPlayerAdded, promiseCharacter, promisePlayerDisconnected } from "shared/utils/player-utils";

export async function initCharacterService() {
	function onSpawn(character: Character, _player: Player) {
		print("Spawned character");

		// Set collision group for all character parts
		character.GetDescendants().forEach((instance) => {
			if (instance.IsA("BasePart")) {
				instance.CollisionGroup = CollisionGroups.PLAYER;
			}
		});

		// Handle any new parts added to character
		character.DescendantAdded.Connect((instance) => {
			if (instance.IsA("BasePart")) {
				instance.CollisionGroup = CollisionGroups.PLAYER;
			}
		});

		const humanoid = character.FindFirstChildOfClass("Humanoid");
		if (humanoid) {
			humanoid.WalkSpeed = SOLDIER_SPEED;
		} else {
			warn(`No humanoid found for character ${character.Name}`);
		}
	}

	onPlayerAdded((player) => {
		const characterAdded = player.CharacterAdded.Connect((character) => {
			promiseCharacter(character).then((character) => onSpawn(character, player));
		});

		promisePlayerDisconnected(player).then(() => {
			characterAdded.Disconnect();
		});
	});
}
