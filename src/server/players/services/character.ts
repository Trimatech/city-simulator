import { CollisionGroups } from "shared/constants/collision-groups";
import { Character, onPlayerAdded, promiseCharacter, promisePlayerDisconnected } from "shared/utils/player-utils";

export async function initCharacterService() {
	function onSpawn(character: Character) {
		warn("Spawned character");

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
	}

	onPlayerAdded((player) => {
		const characterAdded = player.CharacterAdded.Connect((character) => {
			promiseCharacter(character).then(onSpawn);
		});

		promisePlayerDisconnected(player).then(() => {
			characterAdded.Disconnect();
		});
	});
}
